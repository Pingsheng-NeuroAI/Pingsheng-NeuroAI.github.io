---
title: "I’d start an attention lesson with an RNN"
date: 2026-11-23
permalink: /posts/2026/11/causal-attention-from-an-rnn/
redirect_from:
  - /posts/2025/08/blog-post-1/
excerpt: "Unroll a recurrent network, ask what each input contributes, and let the current token choose the weights. Queries, keys, and values can wait until we need them."
mathjax: true
tags:
  - attention
  - sequence models
---

<div class="attention-essay" markdown="1">

I have a small gripe with the usual attention lesson. Three matrices go on the board. One is a query, one is a key, one is a value. Someone offers a dictionary analogy. I can follow the matrix multiplication, but I still have the question I came in with. What calculation would have made me *want* those three matrices in the first place?

I’d erase them for a minute and start with a recurrent neural network (RNN). It already poses the right question. **At time \\(T\\), how much should each earlier input contribute to the state I’m building now?**

## Unroll the recurrence

Give the RNN a fixed initial state and an update rule \\(h_t=f(h_{t-1},x_t)\\). At the fourth step, \\(x_1\\) has passed through three more updates, while \\(x_4\\) has just arrived. In general, the state is some function of the prefix, \\(h_T=F(x_1,\\ldots,x_T)\\). That tells us which inputs it can use. To see what each one contributes, pick a recurrence simple enough to do by hand.

Suppose every step halves the old state and adds the new input. Starting at zero, four steps give

$$
h_4 = \tfrac18 x_1 + \tfrac14 x_2 + \tfrac12 x_3 + x_4.
$$

Look at the coefficient of \\(x_2\\). It is one quarter because it survived two halvings. We could calculate the same result by keeping the four inputs and doing this weighted sum once, right at the end.

The same bookkeeping works with vectors. For a linear RNN with fixed matrices \\(A\\) and \\(B\\) and \\(h_0=0\\),

$$
h_t = A h_{t-1} + B x_t,
\qquad
h_T = \sum_{i=1}^{T} A^{T-i} B x_i.
$$

Here \\(B\\) puts an input into the state space, and each subsequent step applies one more \\(A\\). The readout is exact for this recurrence. Its limitation is easy to spot in the sum. For a given lag \\(T-i\\), the matrix multiplying \\(x_i\\) is the same in every sequence.

## Let the question change the weights

Imagine the prefix says “Ada chose red. Ben chose blue.” I could end it with “What did Ada choose?” or “What did Ben choose?” The two color words occupy exactly the same positions in both versions. What changes is the name in the question. A fixed preference for recent words would favor *blue* both times.

An RNN could learn to carry both associations in its state. I want to try a different design. Keep a vector \\(v_i\\) at each position, and give the current position a direct read from all the vectors it is allowed to see. Call the result \\(z_T\\). I’ll use **one scalar weight per position** so that a single head can turn each vector up or down.

$$
z_T = \sum_{i=1}^{T} \alpha_{Ti}\, v_i.
$$

This is where I’d pause in class. **What should determine \\(\alpha_{Ti}\\)?** In the example, it ought to depend on both the question at \\(T\\) and what was recorded at \\(i\\). Give each pair a compatibility score \\(s_{Ti}\\). One convenient way to turn those scores into shares of the readout is to take a softmax over the available positions.

$$
\alpha_{Ti} = \frac{\exp(s_{Ti})}{\sum_{j=1}^{T}\exp(s_{Tj})},
\qquad i\leq T.
$$

The weights now sum to one. The readout is linear in the values **once the weights are fixed**. Changing an input can also change its score, which changes the weights on the other inputs. That extra dependence is the step from a fixed memory kernel to content-based attention.

<figure class="attention-figure">
  <img src="{{ '/images/attention/recurrence-and-attention.png' | relative_url }}" alt="An unrolled recurrent network passes inputs through successive hidden states. A causal attention head at step four instead reads four stored values directly, each with its own weight.">
  <figcaption>Two routes to a representation at step four. Above, the first input reaches the final state through the intervening updates. Below, the model can change how strongly it reads the first stored value when the current input changes.</figcaption>
</figure>

## Now I have a use for Q, K, and V

So far we’ve left two jobs unspecified. What information is a position offering to the sum? And how does the model judge whether that position is relevant? Those jobs can use different features of the same input. In the color example, the owner’s name helps us find the record, while the color is what we want to retrieve. An earlier causal layer can encode Ben’s name at the position of “blue” and carry the name we asked about to the last position of the question. Now the head has something meaningful to compare.

In one dot-product self-attention head, let \\(x_i\\) be the input representation at position \\(i\\), written as a column vector. Three learned projections, shared across positions, give us

$$
q_T=W_Q x_T, \qquad k_i=W_K x_i, \qquad v_i=W_V x_i.
$$

The **query** represents what the current position is looking for. A **key** supplies features to match against it. The **value** supplies the vector that gets added to the output. The score is their scaled dot product, \\(s_{Ti}=q_T^\top k_i/\sqrt{d_k}\\), where \\(d_k\\) is the number of components in a query or key. If those components are independent, centered, and have unit variance, the unscaled dot product has variance equal to that dimension. Dividing by its square root keeps the softmax from becoming sharper merely because the vectors are wider.

The causal rule was already in our sum. At row \\(T\\), the upper limit is \\(T\\). In next-token prediction the current input is available, so the diagonal is allowed. If we compute every row at once, we implement the same rule by setting future scores to minus infinity **before** the row-wise softmax.

## Change one number

Here’s a head small enough to check with a calculator. Its four scalar keys are \\((0,1,-1,2)\\), and the corresponding values are \\((2,4,8,6)\\). The four queries are \\((1,1,-1,1)\\). Since \\(d_k=1\\), the scores are just products.

<figure class="attention-figure">
  <img src="{{ '/images/attention/causal-attention-weights.png' | relative_url }}" alt="Four rows of causal attention weights. Each row uses only its prefix. In the last row, the weights on positions one through four are about 0.09, 0.24, 0.03, and 0.64.">
  <figcaption>Each row is a separate read. The first has only one possible source, so its weight is exactly one. In the third row the query is negative, making the negative key at position three the strongest match.</figcaption>
</figure>

Look at the last row. With \\(q_4=1\\), the fourth key gets about 64% of the weight, and the weighted output is about **5.24**. Try flipping the sign of just that query. All four stored values stay where they are.

{% include attention-readout.html %}

At \\(q_4=-1\\), the third key gets the largest share. Its value is 8, so the readout rises to **6.17**. At zero, every score ties and we recover the ordinary mean, **5**. That’s the distinction I want from an attention lesson. We changed what the model asked of its memory without rewriting the memory.

If you want the familiar matrix formula, stack the queries, keys, and values as **rows** of \\(Q\\), \\(K\\), and \\(V\\). Let \\(M\\) be zero on and below the diagonal and minus infinity above it. All the reads we just worked through fit on one line.

$$
Z = \operatorname{softmax}_{\mathrm{row}}\!\left(\frac{QK^\top}{\sqrt{d_k}}+M\right)V.
$$

I like this formula much better at the end of the lesson. If I forget which letter does what, I can reconstruct it from the sum. What do I want to carry forward? That’s the value. How much of it do I want *this time*? That takes a comparison, and now I have a reason for both a query and a key.

The two papers I’d put beside this derivation are Bahdanau, Cho, and Bengio’s work on letting a translation decoder weight different source positions, and Vaswani et al.’s formulation of scaled dot-product attention and decoder masking. [Neural Machine Translation by Jointly Learning to Align and Translate](https://arxiv.org/abs/1409.0473) · [Attention Is All You Need](https://arxiv.org/abs/1706.03762)

</div>
