---
title: "From a lever press to a foraging policy"
date: 2026-11-25
permalink: /posts/2026/11/lever-press-neural-timescales/
excerpt: "Hierarchical reinforcement learning gives a forager a choice about when to leave a patch. My EPFL thesis asked what prefrontal activity can tell us about the timescale on which the animal represents its own behavior."
tags:
  - hierarchical reinforcement learning
  - computational neuroscience
  - representation learning
---

At a foraging station, a macaque’s fourth press on a lever delivers a liquid reward. Its fifth press starts a three-minute timer before the station can pay out again. The same movement has two different consequences. To explain why the animal would make that fifth press, it helps to consider what happens on its *next visit*. [Voloh et al., 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10591875/)

Hierarchical reinforcement learning (HRL) gives us a precise way to describe that choice. An agent could select a temporally extended action, or *option*, such as “harvest this patch.” The option has a policy for choosing individual movements and a rule for when to stop. The agent can therefore evaluate a whole visit in terms of the reward it yields and the time it costs, and reuse the policy at a station that requires a different reach. For prefrontal cortex (PFC), that raises a concrete question. **What could carry the identity of the ongoing activity while the animal changes posture, presses, and collects each reward?** [Sutton, Precup & Singh, 1999](https://doi.org/10.1016/S0004-3702(99)00052-1) · [Botvinick, Niv & Barto, 2009](https://pmc.ncbi.nlm.nih.gov/articles/PMC2783353/)

In recordings from freely moving macaques, researchers had already found that frontal activity tracked both recognizable actions and switches between them. They had also measured how long fluctuations in neural activity persisted across frontal regions. A slow neural signal could carry context across movements, but it could also follow a slowly changing input. My master’s thesis in Alexander Mathis’s lab at EPFL connected those observations by asking **which timescale of behavior best predicts a given neural response**. [Voloh et al., 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10591875/) · [Manea et al., 2024](https://doi.org/10.1038/s41467-024-46488-1)

## Learning a hierarchy from behavior

I used recordings from two rhesus macaques, with about 80 sessions per animal containing both 3D pose and neural data. I analyzed the second through fourth presses at a station, when the animal stayed and received the same reward. Across those trials, the cue and outcome repeated while the animal could reach the lever in different ways.

I extended the lab’s hBehaveMAE masked autoencoder to learn jointly from body pose, movement velocities, and task events. One version fused the streams at each time step. A second used masked attention so the streams could exchange information while preserving their own structure. I trained both to reconstruct missing inputs. Each successive level pooled neighboring tokens, so its representation described a longer stretch of behavior. This gave me candidate representations at several timescales without assigning the animal a goal or labeling where a behavioral routine began. [Stoffl et al., original hBehaveMAE model](https://github.com/amathislab/BehaveMAE)

<figure class="half">
  <img src="{{ '/images/thesis-timescales/behavior-model-fusion-simple.webp' | relative_url }}" width="796" height="548" alt="Two streams of red and blue tokens enter a shared multilayer perceptron and emerge as a single green stream.">
  <img src="{{ '/images/thesis-timescales/behavior-model-fusion-attention.webp' | relative_url }}" width="772" height="548" alt="Masked self-attention lets the red and blue streams exchange information while retaining separate outputs for each.">
  <figcaption>The two ways I combined behavioral inputs. For clarity, each diagram shows two streams. From thesis Fig. 4.</figcaption>
</figure>

## Which timescale predicts the spikes?

For each neuron I fitted a linear readout from each model level to firing rate during the two seconds on either side of a press. I chose the level on validation trials and evaluated it on held-out trials. For a control, I disabled temporal pooling and repeated the analysis across successive network stages. This let me test whether pooling over time contributed anything beyond ordinary network depth.

Across six frontal areas and the striatum, task events alone generally predicted the most repeatable responses best. Adding pose and movement often helped with neurons whose responses varied across otherwise similar presses. The premotor neuron below illustrates what the choice of timescale changes. The lowest level followed the abrupt increase in firing after the press. The highest level captured the broader period of elevated activity.

<figure class="half">
  <img src="{{ '/images/thesis-timescales/premotor-level-0.webp' | relative_url }}" width="792" height="395" loading="lazy" alt="The level-zero prediction follows the sharp post-press increase in a premotor neuron’s mean firing rate.">
  <img src="{{ '/images/thesis-timescales/premotor-level-3.webp' | relative_url }}" width="801" height="395" loading="lazy" alt="The level-three prediction for the same neuron rises and falls more gradually.">
  <figcaption>The same neuron and trials in both panels. Blue is the measured mean firing rate and dashed red is the prediction. The lever press occurs at zero seconds. From thesis Fig. 11A.</figcaption>
</figure>

The more revealing test went in the other direction. Within each region, I grouped neuron–station pairs by the model level that best predicted their firing. Then I went back to the spikes and estimated each group’s intrinsic timescale from the decay of its autocorrelation. **Groups best predicted by longer behavioral windows also had more persistent neural activity.** The correlation was *r* = 0.51 (*p* = 0.005) in the attention-based hierarchical model. Grouping by stage in its control gave *r* = 0.19 (*p* = 0.327). The simpler fusion model also showed a positive association with pooling (*r* = 0.47, *p* = 0.011).

<figure class="half">
  <img src="{{ '/images/thesis-timescales/timescale-hierarchical.webp' | relative_url }}" width="851" height="685" loading="lazy" alt="Neural groups assigned to higher hierarchical levels tend to have longer intrinsic timescales. Colors identify seven brain regions.">
  <img src="{{ '/images/thesis-timescales/timescale-control.webp' | relative_url }}" width="792" height="685" loading="lazy" alt="The relationship between stage and neural timescale is weaker in the control model with temporal pooling disabled.">
  <figcaption>Intrinsic timescale at the lever press, grouped by best-predicting level or stage. Dashed lines show linear fits. From thesis Fig. 12B.</figcaption>
</figure>

## From temporal structure to control

A neural timescale measures persistence. An option makes a claim about control. Knowing which routine is active should help predict which action comes next and when the animal will switch. My four-second windows captured the first property. To test the second, I would look for a signal that generalizes across different ways of working a patch and changes when the animal decides to leave.

The comparison I would run is between visits with similar presses, reward histories, and elapsed times that end in different choices. I would fit a candidate option model to behavior alone and test whether its estimated probability of ending a visit explains PFC activity beyond those matched variables. I would then ask whether a readout trained at one station could anticipate departures at another, before the monkey moves away. A signal that transfers across stations requiring different postures would be a candidate neural marker of option termination.
