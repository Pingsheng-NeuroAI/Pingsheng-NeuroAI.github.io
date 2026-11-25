---
title: "From a lever press to a foraging policy"
date: 2026-11-25
permalink: /posts/2026/11/lever-press-neural-timescales/
excerpt: "A macaque can press a lever for a drink or to make a future drink possible. My EPFL thesis asked whether the timescale of its movements predicts how long a neural response persists."
tags:
  - hierarchical reinforcement learning
  - computational neuroscience
  - representation learning
---

A macaque presses a lever for the fourth time and gets a drink. It presses a fifth time and gets nothing. Why bother? At this reward station, the fifth press starts a three-minute timer. When the macaque comes back, the station can pay out again. The value of the movement depends on what the animal will do next. [Voloh et al., 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10591875/)

Hierarchical reinforcement learning gives this puzzle a vocabulary. An *option* such as “harvest this patch” has a policy for choosing individual actions and a rule for when to stop. If the prefrontal cortex (PFC) helps organize a whole visit, some activity should persist while the animal reaches, presses, and drinks. My master’s thesis in Alexander Mathis’s lab at EPFL tested one part of that idea. **Do neural responses that persist longer also track behavior over longer windows?** [Sutton, Precup & Singh, 1999](https://doi.org/10.1016/S0004-3702(99)00052-1) · [Botvinick, Niv & Barto, 2009](https://pmc.ncbi.nlm.nih.gov/articles/PMC2783353/)

<figure class="pfc-figure">
  <img src="{{ '/images/thesis-timescales/foraging-press-window.webp' | relative_url }}" width="1302" height="957" alt="A possible visit includes four rewarded presses and a fifth that starts a three-minute reset. The analysis zooms in on the four seconds surrounding a rewarded stay press, numbered two through four.">
  <figcaption><strong>A press belongs to a visit.</strong> The monkey could leave after any press. I compared presses two through four at the same station, when the reward was the same but the movement could vary. Does frontal activity follow the brief reach, or does it carry information across several movements within the visit? <a href="https://doi.org/10.1016/j.celrep.2023.113091">Experimental design from Voloh et al.</a></figcaption>
</figure>

## How much behavior does a neuron track?

Benjamin Voloh and colleagues collected simultaneous body tracking and neural recordings from freely foraging macaques. Jan Zimmermann shared the data for my thesis. Their work had shown that frontal activity tracked actions and switches between them. Manea and colleagues also found that the persistence of neural activity varied across regions during foraging. The recordings let me bring those observations together for the same movements. [Voloh et al., 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC10591875/) · [Manea et al., 2024](https://doi.org/10.1038/s41467-024-46488-1)

<figure class="pfc-figure">
  <img src="{{ '/images/thesis-timescales/behavior-to-firing.webp' | relative_url }}" width="1440" height="1401" loading="lazy" alt="Pose, velocity, and task events feed a model with four increasingly wide temporal windows. Each level predicts neural firing separately. Validation trials identify the best level for each neuron at each station.">
  <figcaption><strong>Four views of the same press predict the same recorded spikes.</strong> I extended hBehaveMAE to combine pose, velocity, and task events. Each level pooled behavior over a different window. I selected the best level on validation trials and tested its prediction on held-out trials. <a href="https://doi.org/10.1007/978-3-031-73039-9_7">Original pose model by Stoffl et al.</a></figcaption>
</figure>

Across about 80 sessions per animal in two rhesus macaques, event timing alone generally predicted the most repeatable neural responses best. Adding pose and velocity often helped for neurons whose firing varied across otherwise similar presses. To see what temporal pooling changed, compare two predictions for one premotor neuron.

<details class="pfc-model-detail">
  <summary>How I combined the three input streams</summary>
  <p>Lucas Stoffl, Andy Bonnetto, Stéphane d’Ascoli, and Alexander Mathis developed the original hBehaveMAE for motion capture. I built two multimodal extensions. One concatenated tokens from the streams at each time step and mixed them with a shared multilayer perceptron. The other let streams exchange information through masked self-attention. The readout analysis drew on Alessandro Marin Vargas’s linear-probe framework.</p>
  <div class="pfc-panels">
    <img src="{{ '/images/thesis-timescales/behavior-model-fusion-simple.webp' | relative_url }}" width="796" height="548" loading="lazy" alt="Shared multilayer perceptron merging tokens from two example streams.">
    <img src="{{ '/images/thesis-timescales/behavior-model-fusion-attention.webp' | relative_url }}" width="772" height="548" loading="lazy" alt="Masked self-attention connects tokens across two streams while retaining their structure.">
  </div>
  <p>Two of the three streams are shown for clarity. Thesis Fig. 4.</p>
</details>

<figure class="pfc-figure">
  <div class="pfc-panels">
    <div><b>H0 · Shortest window</b><img src="{{ '/images/thesis-timescales/premotor-level-0.webp' | relative_url }}" width="792" height="395" loading="lazy" alt="Same premotor neuron in both panels. At level zero the predicted firing rate rises steeply just after the press and drops sharply around one second."></div>
    <div><b>H3 · Longest window</b><img src="{{ '/images/thesis-timescales/premotor-level-3.webp' | relative_url }}" width="801" height="395" loading="lazy" alt="At level three the prediction rises and falls gradually across the same recorded burst of firing."></div>
  </div>
  <figcaption><strong>One neuron, two shapes of prediction.</strong> The blue line is the same measured response in both panels. The red dashed prediction at H0 picks up the abrupt rise and fall after the lever press (0 s). At H3 it follows the broader period of elevated firing. Does the level that fits best tell us anything about the neurons themselves? Thesis Fig. 11A.</figcaption>
</figure>

## Do slower neural responses prefer longer windows?

I went back to the spikes for a second measurement. Within each brain region, I grouped neuron–station pairs by their best-predicting level. If the group’s spike counts stayed correlated across longer time lags, its *intrinsic timescale* was longer. I repeated the analysis in a control of the same depth with temporal pooling disabled.

<figure class="pfc-figure">
  <div class="pfc-panels">
    <div><b>With temporal pooling · <i>r</i> = 0.51</b><img src="{{ '/images/thesis-timescales/timescale-hierarchical.webp' | relative_url }}" width="851" height="685" loading="lazy" alt="Across model levels zero to three, the fitted line rises. The correlation between preferred level and neural timescale is 0.51, p = 0.005."></div>
    <div><b>Without pooling · <i>r</i> = 0.19</b><img src="{{ '/images/thesis-timescales/timescale-control.webp' | relative_url }}" width="792" height="685" loading="lazy" alt="Grouping responses by stage in the control gives a flatter fitted line and a correlation of 0.19, p = 0.327."></div>
  </div>
  <figcaption><strong>Groups best predicted from longer behavioral windows tended to have more persistent firing.</strong> Within each region (color), I grouped neuron–station pairs by their best-predicting level. Each dot gives the group’s intrinsic timescale at the press. A higher dot means its spike correlations decayed more slowly. In the attention-based model the association was <i>r</i> = 0.51 (<i>p</i> = 0.005). Grouping by depth in the control gave <i>r</i> = 0.19 (<i>p</i> = 0.327). Thesis Fig. 12B.</figcaption>
</figure>

The simpler fusion model also showed a positive association with pooling (*r* = 0.47, *p* = 0.011). Across six frontal areas and the striatum, a model trained on behavior could help identify groups of neurons whose activity persisted over different timescales. That result takes us back to the visit as a whole. A signal can persist while an animal works at a station. To connect it to control, I would want to know whether it anticipates the decision to leave **before the animal moves away**.

## Could PFC activity anticipate leaving?

<figure class="pfc-figure">
  <img src="{{ '/images/thesis-timescales/option-termination-test.webp' | relative_url }}" width="1440" height="1323" loading="lazy" alt="Proposed experiment. Compare matched visits with different upcoming choices. Fit a neural readout at station A before the animal moves, then test whether it anticipates departure at station B.">
  <figcaption><strong>A proposed test of the option’s stopping rule.</strong> Match presses with similar reward histories and elapsed times, then separate visits that continue from those that end. A PFC signal that anticipates departure at a second station, where reaching requires a different posture, would be evidence for a stopping decision that generalizes across movements.</figcaption>
</figure>

I would first fit the option model to behavior alone. I could then ask whether its estimated probability of ending a visit explains anything in pre-departure PFC activity beyond the matched variables. That is what makes a fifth press interesting to me. The movement is visible immediately. The policy that could make it worthwhile plays out over the rest of the visit and the return to the station.

## Model and data references

- **Original hBehaveMAE model.** Lucas Stoffl, Andy Bonnetto, Stéphane d’Ascoli, and Alexander Mathis. *Elucidating the Hierarchical Nature of Behavior with Masked Autoencoders*. ECCV 2024. [Paper](https://doi.org/10.1007/978-3-031-73039-9_7) · [Authors’ implementation](https://github.com/amathislab/BehaveMAE)
- **Foraging experiment and recordings.** Benjamin Voloh, David J.-N. Maisson, Roberto Lopez Cervera, Indirah Conover, Mrunal Zambre, Benjamin Hayden, and Jan Zimmermann. *Hierarchical action encoding in prefrontal cortex of freely moving macaques*. Cell Reports, 2023. [Paper](https://doi.org/10.1016/j.celrep.2023.113091) · [Archived data and code](https://zenodo.org/records/8067596)
