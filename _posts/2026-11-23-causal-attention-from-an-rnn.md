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

<figure class="attention-figure">
  <div class="attention-diagram">
    <p class="attention-diagram__title">Each update halves what came before</p>
    <div class="attention-decay" role="list" aria-label="Weights of four inputs in the final state">
      <div role="listitem"><span>Input 1</span><i style="--share:12.5%" aria-hidden="true"></i><b>⅛</b></div>
      <div role="listitem"><span>Input 2</span><i style="--share:25%" aria-hidden="true"></i><b>¼</b></div>
      <div role="listitem"><span>Input 3</span><i style="--share:50%" aria-hidden="true"></i><b>½</b></div>
      <div role="listitem"><span>Input 4</span><i style="--share:100%" aria-hidden="true"></i><b>1</b></div>
    </div>
  </div>
  <figcaption><strong>A recurrence already assigns weights to the past.</strong> Start at zero, halve the previous state, and add the new input. At step four, each bar gives the coefficient of that input in the sum. The first input has survived three halvings. Its coefficient is fixed even if it is the input we now care about most.</figcaption>
</figure>

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
  <img src="{{ '/images/attention/recurrence-and-attention.png' | relative_url }}" width="1380" height="1044" alt="An unrolled recurrent network passes four inputs through successive hidden states. In the attention head below it, four arrows carry weighted values directly to the output.">
  <figcaption><strong>Let the current position choose how much to read.</strong> Above, earlier inputs pass through successive updates. Below, each position keeps a value, <i>v</i>, to contribute directly. Score each available position against the current one, then apply softmax to get positive weights, <i>α</i>, that sum to one. With those weights fixed, the output is a weighted sum of the values.</figcaption>
</figure>

## Now I have a use for Q, K, and V

So far we’ve left two jobs unspecified. What information is a position offering to the sum? And how does the model judge whether that position is relevant? Those jobs can use different features of the same input. In the color example, the owner’s name helps us find the record, while the color is what we want to retrieve. An earlier causal layer can encode Ben’s name at the position of “blue” and carry the name we asked about to the last position of the question. Now the head has something meaningful to compare.

In one dot-product self-attention head, let \\(x_i\\) be the input representation at position \\(i\\), written as a column vector. Three learned projections, shared across positions, give us

$$
q_T=W_Q x_T, \qquad k_i=W_K x_i, \qquad v_i=W_V x_i.
$$

The **query** represents what the current position is looking for. A **key** supplies features to match against it. The **value** supplies the vector that gets added to the output. The score is their scaled dot product, \\(s_{Ti}=q_T^\top k_i/\sqrt{d_k}\\), where \\(d_k\\) is the number of components in a query or key. If those components are independent, centered, and have unit variance, the unscaled dot product has variance equal to that dimension. Dividing by its square root keeps the softmax from becoming sharper merely because the vectors are wider.

<figure class="attention-figure">
  <div class="attention-diagram">
    <p class="attention-diagram__title">One query reads four stored records</p>
    <table class="attention-records" aria-label="Example dot-product attention from query plus one at position four">
      <thead><tr><th scope="col">Position</th><th scope="col">1</th><th scope="col">2</th><th scope="col">3</th><th scope="col">4</th></tr></thead>
      <tbody>
        <tr><th scope="row">Key</th><td>0</td><td>1</td><td>−1</td><td>2</td></tr>
        <tr><th scope="row">Value</th><td>2</td><td>4</td><td>8</td><td>6</td></tr>
        <tr><th scope="row">Score at <i>q</i> = 1</th><td>0</td><td>1</td><td>−1</td><td>2</td></tr>
        <tr><th scope="row">Weight</th><td>8.7%</td><td>23.7%</td><td>3.2%</td><td><b>64.4%</b></td></tr>
      </tbody>
    </table>
  </div>
  <figcaption><strong>The query and key determine the weight. The value determines what gets added.</strong> These keys are one-dimensional, so multiplying each key by the query gives its score. Softmax gives position four the largest share. We multiply that share by its value, 6, then add the other three weighted values to get 5.24.</figcaption>
</figure>

The causal rule was already in our sum. At row \\(T\\), the upper limit is \\(T\\). In next-token prediction the current input is available, so the diagonal is allowed. If we compute every row at once, we implement the same rule by setting future scores to minus infinity **before** the row-wise softmax.

## Change one number

Keep those four keys and values. Now let each position take a turn reading its own prefix, using the queries \\((1,1,-1,1)\\). What should happen in the third row, where the query is negative and the fourth input hasn’t arrived?

<figure class="attention-figure">
  <img src="{{ '/images/attention/causal-attention-weights.png' | relative_url }}" width="1380" height="1011" loading="lazy" alt="Four query rows show weights on the current and earlier positions. Future positions are hatched. The strongest match in row three is its negative key. The last row gives a weighted sum of 5.24.">
  <figcaption><strong>Mask the future before normalizing each row.</strong> A row is the position asking and a column is the position it can read. Hatched cells get zero weight. In row three, the negative query favors the negative key in column three. Row four can use the entire prefix and recovers the four weights above. Multiplying these rows by the stored values gives all four outputs.</figcaption>
</figure>

Try flipping the sign of just the last query. Before you move the slider, pick the value you think will get the largest share.

<figure class="attention-figure">
{% include attention-readout.html %}
  <figcaption><strong>The same memory can answer a different query.</strong> At +1 the fourth value gets the largest share and the output is 5.24. At −1 the third value, 8, gets the largest share and the output rises to 6.17. At zero every score ties, so the head returns the ordinary mean, 5.</figcaption>
</figure>

If you want the familiar matrix formula, stack the queries, keys, and values as **rows** of \\(Q\\), \\(K\\), and \\(V\\). Let \\(M\\) be zero on and below the diagonal and minus infinity above it. All the reads we just worked through fit on one line.

$$
Z = \operatorname{softmax}_{\mathrm{row}}\!\left(\frac{QK^\top}{\sqrt{d_k}}+M\right)V.
$$

I like this formula much better at the end of the lesson. If I forget which letter does what, I can reconstruct it from the sum. What do I want to carry forward? That’s the value. How much of it do I want *this time*? That takes a comparison, and now I have a reason for both a query and a key.

The two papers I’d put beside this derivation are Bahdanau, Cho, and Bengio’s work on letting a translation decoder weight different source positions, and Vaswani et al.’s formulation of scaled dot-product attention and decoder masking. [Neural Machine Translation by Jointly Learning to Align and Translate](https://arxiv.org/abs/1409.0473) · [Attention Is All You Need](https://arxiv.org/abs/1706.03762)

</div>
