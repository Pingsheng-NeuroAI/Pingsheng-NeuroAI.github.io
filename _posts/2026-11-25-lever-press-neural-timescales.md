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

In the foraging task studied by Benjamin Voloh and colleagues, a macaque’s fourth press on a station’s lever delivers a liquid reward. Its fifth press starts a three-minute timer before the station can pay out again. The same movement has two different consequences. To explain why the animal would make that fifth press, it helps to consider what happens on its *next visit*. [Voloh et al., 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10591875/)

Hierarchical reinforcement learning (HRL) gives us a precise way to describe that choice. An agent could select a temporally extended action, or *option*, such as “harvest this patch.” The option has a policy for choosing individual movements and a rule for when to stop. The agent can therefore evaluate a whole visit in terms of the reward it yields and the time it costs, and reuse the policy at a station that requires a different reach. For prefrontal cortex (PFC), that raises a concrete question. **What could carry the identity of the ongoing activity while the animal changes posture, presses, and collects each reward?** [Sutton, Precup & Singh, 1999](https://doi.org/10.1016/S0004-3702(99)00052-1) · [Botvinick, Niv & Barto, 2009](https://pmc.ncbi.nlm.nih.gov/articles/PMC2783353/)

Voloh and colleagues found that frontal activity tracked both recognizable actions and switches between them. Manea and colleagues subsequently measured how long fluctuations in neural activity persisted across frontal regions during foraging. A slow neural signal could carry context across movements, but it could also follow a slowly changing input. My master’s thesis in Alexander Mathis’s lab at EPFL connected those observations by asking **which timescale of behavior best predicts a given neural response**. [Voloh et al., 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10591875/) · [Manea et al., 2024](https://doi.org/10.1038/s41467-024-46488-1)

## Learning a hierarchy from behavior

My starting point was the foraging dataset collected by the team behind Voloh et al. (2023). Jan Zimmermann shared the recordings for my thesis. About 80 sessions from each of two rhesus macaques contained both 3D pose and neural data. I analyzed the second through fourth presses at a station, when the animal stayed and received the same reward. Across those trials, the cue and outcome repeated while the animal could reach the lever in different ways.

I extended **hBehaveMAE** to model body pose, movement velocities, and task events jointly. Lucas Stoffl, Andy Bonnetto, Stéphane d’Ascoli, and Alexander Mathis developed the original hierarchical masked autoencoder for motion capture data. Its temporal pooling gave me a way to represent the same lever press at several timescales. [Stoffl et al., ECCV 2024](https://doi.org/10.1007/978-3-031-73039-9_7)

For my thesis, I developed two multimodal variants. The first concatenated tokens from the three streams at each time step and used a shared multilayer perceptron to combine them. The second used masked self-attention so that the streams could exchange information while preserving the structure within each one. I then tested which levels of these models best predicted spikes on held-out trials.

<figure class="half">
  <img src="{{ '/images/thesis-timescales/behavior-model-fusion-simple.webp' | relative_url }}" width="796" height="548" alt="Two streams of red and blue tokens enter a shared multilayer perceptron and emerge as a single green stream.">
  <img src="{{ '/images/thesis-timescales/behavior-model-fusion-attention.webp' | relative_url }}" width="772" height="548" alt="Masked self-attention lets the red and blue streams exchange information while retaining separate outputs for each.">
  <figcaption>The two fusion variants I developed for the multimodal extension, illustrated with two input streams. Thesis Fig. 4. The base architecture is hBehaveMAE (Stoffl et al., 2024).</figcaption>
</figure>

## Which timescale predicts the spikes?

For each neuron I fitted a linear readout from each model level to firing rate during the two seconds on either side of a press. I chose the level on validation trials and evaluated it on held-out trials. For a control, I disabled temporal pooling and repeated the analysis across successive network stages. This let me test whether pooling over time contributed anything beyond ordinary network depth.

Across six frontal areas and the striatum, task events alone generally predicted the most repeatable responses best. Adding pose and movement often helped with neurons whose responses varied across otherwise similar presses. The premotor neuron below illustrates what the choice of timescale changes. The lowest level followed the abrupt increase in firing after the press. The highest level captured the broader period of elevated activity.

<figure class="half">
  <img src="{{ '/images/thesis-timescales/premotor-level-0.webp' | relative_url }}" width="792" height="395" loading="lazy" alt="The level-zero prediction follows the sharp post-press increase in a premotor neuron’s mean firing rate.">
  <img src="{{ '/images/thesis-timescales/premotor-level-3.webp' | relative_url }}" width="801" height="395" loading="lazy" alt="The level-three prediction for the same neuron rises and falls more gradually.">
  <figcaption>One premotor neuron from the Voloh et al. recordings. Blue is the measured mean firing rate and dashed red is the prediction. The lever press occurs at zero seconds. Thesis analysis, Fig. 11A.</figcaption>
</figure>

The more revealing test went in the other direction. Within each region, I grouped neuron–station pairs by the model level that best predicted their firing. Then I went back to the spikes and estimated each group’s intrinsic timescale from the decay of its autocorrelation. **Groups best predicted by longer behavioral windows also had more persistent neural activity.** The correlation was *r* = 0.51 (*p* = 0.005) in the attention-based hierarchical model. Grouping by stage in its control gave *r* = 0.19 (*p* = 0.327). The simpler fusion model also showed a positive association with pooling (*r* = 0.47, *p* = 0.011).

<figure class="half">
  <img src="{{ '/images/thesis-timescales/timescale-hierarchical.webp' | relative_url }}" width="851" height="685" loading="lazy" alt="Neural groups assigned to higher hierarchical levels tend to have longer intrinsic timescales. Colors identify seven brain regions.">
  <img src="{{ '/images/thesis-timescales/timescale-control.webp' | relative_url }}" width="792" height="685" loading="lazy" alt="The relationship between stage and neural timescale is weaker in the control model with temporal pooling disabled.">
  <figcaption>Intrinsic timescale at the lever press, grouped by best-predicting level or stage. Dashed lines show linear fits. Thesis analysis of the Voloh et al. recordings, Fig. 12B.</figcaption>
</figure>

## From temporal structure to control

A neural timescale measures persistence. An option makes a claim about control. Knowing which routine is active should help predict which action comes next and when the animal will switch. My four-second windows captured the first property. To test the second, I would look for a signal that generalizes across different ways of working a patch and changes when the animal decides to leave.

The comparison I would run is between visits with similar presses, reward histories, and elapsed times that end in different choices. I would fit a candidate option model to behavior alone and test whether its estimated probability of ending a visit explains PFC activity beyond those matched variables. I would then ask whether a readout trained at one station could anticipate departures at another, before the monkey moves away. A signal that transfers across stations requiring different postures would be a candidate neural marker of option termination.


## Model and data references

- **Original hBehaveMAE model.** Lucas Stoffl, Andy Bonnetto, Stéphane d’Ascoli, and Alexander Mathis. *Elucidating the Hierarchical Nature of Behavior with Masked Autoencoders*. ECCV 2024. [Paper](https://doi.org/10.1007/978-3-031-73039-9_7) · [Authors’ implementation](https://github.com/amathislab/BehaveMAE)
- **Foraging experiment and recordings.** Benjamin Voloh, David J.-N. Maisson, Roberto Lopez Cervera, Indirah Conover, Mrunal Zambre, Benjamin Hayden, and Jan Zimmermann. *Hierarchical action encoding in prefrontal cortex of freely moving macaques*. Cell Reports, 2023. [Paper](https://doi.org/10.1016/j.celrep.2023.113091) · [Archived data and code](https://zenodo.org/records/8067596)
