---
title: "One lever press, several neural timescales"
date: 2026-11-25
permalink: /posts/2026/11/lever-press-neural-timescales/
excerpt: "For my EPFL master’s thesis, I built a model of freely foraging macaques. The level that best predicted a neural response told me something about how long that response tended to persist."
tags:
  - computational neuroscience
  - representation learning
  - time series
---

A macaque can press a lever twice and collect juice both times. To the experimenter, those presses are the same event. To the animal, one might involve reaching out and the other barely shifting its weight. A neuron that responds to the reward cue has good reason to behave similarly on both trials. A neuron sensitive to the movement might do something quite different.

For my master’s thesis in Alexander Mathis’s lab at EPFL, I built a model that could describe the same press at several timescales. Then I asked a question about the biology. **If a neuron’s firing is easier to predict from a longer stretch of behavior, does its activity also tend to persist for longer?**

## Learning from the animal before looking at the neurons

I worked with recordings from two freely foraging rhesus macaques. A 62-camera system tracked their movements as they visited reward stations. About 80 sessions per animal had both pose and neural recordings. I focused on the second through fourth presses at the same station, taking the two seconds on either side of each press. That gave me a repeatable event while preserving the variation in how each animal approached it. [The foraging dataset and task](https://pmc.ncbi.nlm.nih.gov/articles/PMC10591875/)

I extended the lab’s hBehaveMAE masked autoencoder to combine the animal’s body configuration, its movement velocities, and task events such as cues and rewards. I built two versions. The simpler one combined inputs at matching time steps. The more flexible one used an attention mask so the streams could exchange information while each kept its own arrangement of tokens. During training, the model reconstructed missing behavioral inputs. Successive levels combined neighboring tokens into features spanning longer intervals. [The original hBehaveMAE model](https://github.com/amathislab/BehaveMAE)

<figure class="half">
  <img src="{{ '/images/thesis-timescales/behavior-model-fusion-simple.webp' | relative_url }}" width="796" height="548" alt="Two streams of red and blue tokens enter a shared multilayer perceptron and emerge as a single green stream.">
  <img src="{{ '/images/thesis-timescales/behavior-model-fusion-attention.webp' | relative_url }}" width="772" height="548" alt="Masked self-attention lets the red and blue streams exchange information while retaining separate outputs for each.">
  <figcaption>The two ways I combined behavioral inputs. For clarity, each diagram shows two streams. From thesis Fig. 4.</figcaption>
</figure>

Only then did I bring in the spikes. For each neuron, I fitted a linear readout from each level to its firing rate, selected the level on validation trials, and scored it on held-out trials. I also ran the same comparison with token pooling switched off. That control let me ask what organizing behavior at progressively longer timescales added beyond the depth of the network itself.

## Which neurons benefited from seeing the movement?

I compared predictions across six frontal areas and the striatum. Temporal pooling helped in several regions, including supplementary motor and orbitofrontal cortex. The choice of input mattered, too. For neurons whose responses repeated reliably from press to press, task events alone generally gave the best predictions. Knowing when the reward cue appeared was already informative. For less repeatable responses, adding the animal’s pose and movement often helped. The monkey could earn the same reward with a different movement.

One premotor neuron makes the difference between model levels visible. Its firing rate rose sharply after the press. The lowest level followed that rise more closely, while the highest level captured the broader period of elevated activity.

<figure class="half">
  <img src="{{ '/images/thesis-timescales/premotor-level-0.webp' | relative_url }}" width="792" height="395" loading="lazy" alt="The level-zero prediction follows the sharp post-press increase in a premotor neuron’s mean firing rate.">
  <img src="{{ '/images/thesis-timescales/premotor-level-3.webp' | relative_url }}" width="801" height="395" loading="lazy" alt="The level-three prediction for the same neuron rises and falls more gradually.">
  <figcaption>The same neuron and trials in both panels. Blue is the measured mean firing rate and dashed red is the prediction. The lever press occurs at zero seconds. From thesis Fig. 11A.</figcaption>
</figure>

## Do the model’s timescales line up with the brain’s?

For each neuron at each reward station, I found the level that best predicted its activity. Within each region, I grouped those responses by their preferred level and estimated how quickly fluctuations in each group’s recorded activity lost their correlation over time. I could then compare the timescale measured from spikes with the model level selected by its predictions.

**Groups best predicted by higher levels tended to have longer intrinsic timescales.** Across the groups, the correlation was *r* = 0.51 (*p* = 0.005) for the attention-based hierarchical model. Repeating the analysis for the ordinary stages of its nonhierarchical control gave *r* = 0.19 (*p* = 0.327). The simpler fusion model showed the same positive association when it included temporal pooling (*r* = 0.47, *p* = 0.011).

<figure class="half">
  <img src="{{ '/images/thesis-timescales/timescale-hierarchical.webp' | relative_url }}" width="851" height="685" loading="lazy" alt="Neural groups assigned to higher hierarchical levels tend to have longer intrinsic timescales. Colors identify seven brain regions.">
  <img src="{{ '/images/thesis-timescales/timescale-control.webp' | relative_url }}" width="792" height="685" loading="lazy" alt="The relationship between stage and neural timescale is weaker in the control model with temporal pooling disabled.">
  <figcaption>Intrinsic timescale at the lever press, grouped by best-predicting level or stage. Dashed lines show linear fits. From thesis Fig. 12B.</figcaption>
</figure>

What I find most interesting is that even within one brain region, different responses were best predicted at different levels. A region can contain cells that track the sharp onset of an event alongside others whose activity changes more gradually. Extending the analysis beyond the four seconds around a press would let me ask whether still slower features track the animal’s progress through a sequence of presses as the juice runs out. [Master’s defense slides](https://docs.google.com/presentation/d/1lEp6QGKNORnOqd1wCBm3jA9Bc4F-I38MvM0Nz7oCQ2c/edit?usp=sharing)
