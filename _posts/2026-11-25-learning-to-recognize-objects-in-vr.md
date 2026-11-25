---
title: "What changes when you can turn an object over?"
date: 2026-11-25
permalink: /posts/2026/11/learning-to-recognize-objects-in-vr/
excerpt: "In the VR task I built at SilicoLabs, people chose which views of an unfamiliar object to inspect. Replaying those views to a model would let us ask what the act of looking contributes to learning."
tags:
  - visual learning
  - virtual reality
---

<link rel="stylesheet" href="{{ '/assets/css/vr-learning.css' | relative_url }}">

From straight ahead, a pointed tip can look like a rounded bump. A quarter turn might settle which it is. During my internship at SilicoLabs, I built a Unity experiment around that quarter turn. If two people learn to recognize the same object, how much depends on the views they find for themselves?

## What counts as one trial?

In Michael Lee and James DiCarlo’s object-learning experiment, a person saw a single image, chose between two objects, and received feedback. A model with a fixed visual encoder could capture much of the human learning pattern by updating its decision weights. I wanted to keep the choice and feedback while giving people control over the visual evidence. [Lee and DiCarlo, 2023](https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1011713)

<figure class="vr-figure">
  <div class="vr-sheet">
    <strong class="vr-heading">One choice per trial. Who picks the view?</strong>
    <div class="vr-fixed"><strong>Fixed-image experiment</strong><br>See one assigned image for about 200 ms, then choose.</div>
    <div class="vr-observation">
      <img src="{{ '/images/silicolabs/greeble-in-hand.webp' | relative_url }}" width="216" height="117" alt="A purple object held by a virtual hand in the Unity prototype.">
      <span><strong>SilicoLabs VR experiment</strong><br>Turn a 3D object by hand or controller. Inspect it for up to 10 seconds.</span>
    </div>
    <div class="vr-sequence"><span>Inspect</span><span class="vr-arrow" aria-hidden="true">→</span><span>Choose class 0 or 1</span><span class="vr-arrow" aria-hidden="true">→</span><span>See feedback</span></div>
  </div>
  <figcaption><strong>Figure 1.</strong> Rotation makes the sequence of views part of the participant’s response. The inset shows a Greeble held in the VR prototype. A participant could end inspection early and answer as soon as a feature came into view.</figcaption>
</figure>

I built the VR task and its data collection and analysis pipeline. Each trial ended with one category choice, but the person could arrive at it through a different sequence of views. [Watch the VR task demo](https://docs.google.com/file/d/1JpHDMvxN1dOhTFxCJ_DOXbYoLr2sHryY/preview)

## What is worth turning the object to see?

We used *Greebles*, unfamiliar 3D objects that Isabel Gauthier and Michael Tarr used to study visual expertise. Compare the heads below. In the middle example of each category, the small part pointing toward the camera is especially easy to compare. Once you know where to look, a new body shape can carry a familiar cue. [Gauthier and Tarr, 1997](https://www.sciencedirect.com/science/article/pii/S0042698996002866)

<figure class="vr-figure">
  <div class="vr-sheet">
    <strong class="vr-heading">Two head parts define the category</strong>
    <div class="vr-panel-grid">
      <div class="vr-panel"><strong>Class 0</strong><img src="{{ '/images/silicolabs/greeble-category-0.webp' | relative_url }}" width="555" height="260" loading="lazy" alt="Three purple Greebles with the class 0 combination of head parts circled in red."></div>
      <div class="vr-panel"><strong>Class 1</strong><img src="{{ '/images/silicolabs/greeble-category-1.webp' | relative_url }}" width="550" height="260" loading="lazy" alt="Three Greebles with similar body outlines and the different class 1 head parts circled in red."></div>
    </div>
    <div class="vr-transfer"><strong>Transfer test design</strong><br>Train on three body shapes. Test the same part rule on two unseen body shapes.</div>
  </div>
  <figcaption><strong>Figure 2.</strong> The red ovals mark the boge and quiff, two small projections on the head. Each category has its own combination. Classifying an unfamiliar body correctly would show that a learner could use a cue that transfers across shapes.</figcaption>
</figure>

## What did the pilot show?

<figure class="vr-figure">
  <div class="vr-sheet">
    <strong class="vr-heading">Two people showed different learning curves</strong>
    <div class="vr-panel-grid">
      <div class="vr-panel"><img src="{{ '/images/silicolabs/pilot-participant-0.jpg' | relative_url }}" width="576" height="453" loading="lazy" alt="Participant 0’s accuracy fluctuates near one-half and ends around 0.42 after roughly 100 trials."><p class="vr-pilot-result"><strong>Participant 0</strong>Ended near 42% after roughly 100 trials.</p></div>
      <div class="vr-panel"><img src="{{ '/images/silicolabs/pilot-participant-1.jpg' | relative_url }}" width="567" height="453" loading="lazy" alt="Participant 1’s accuracy rises after an early dip and ends around 0.77 after just over 50 trials."><p class="vr-pilot-result"><strong>Participant 1</strong>Ended near 77% after just over 50 trials.</p></div>
    </div>
  </div>
  <figcaption><strong>Figure 3.</strong> Pilot observations from two individual sessions. Both plots show accuracy against trial number. The original axes span different ranges. The curves show how often each person chose correctly. Which views helped them do so remains open.</figcaption>
</figure>

The first participant hovered around one-half correct for much of the session. The second recovered from an early dip and reached about three-quarters correct. I wondered whether introducing the easier quiff distinction first might help someone learn to notice the subtler boge. That question calls for a comparison of training orders.

## Can the views themselves explain a learning curve?

I proposed replaying exactly what the participant saw to a vision model. The replay matters because a person who turns the quiff into profile has already made a useful decision before pressing a category button.

<figure class="vr-figure">
  <div class="vr-sheet">
    <strong class="vr-heading">Proposed test of who chooses the views</strong>
    <dl class="vr-comparison">
      <dt>Human trial</dt><dd>Human chooses views <span aria-hidden="true">→</span> human classifies.</dd>
      <dt>Replay</dt><dd>Same human views, same order <span aria-hidden="true">→</span> model classifies.</dd>
      <dt>Active agent</dt><dd>Agent chooses its own views <span aria-hidden="true">→</span> model classifies.</dd>
    </dl>
  </div>
  <figcaption><strong>Figure 4.</strong> In the proposed replay experiment a fixed visual encoder and trainable classifier would receive the participant’s sequence. A reinforcement learning agent could then choose its own turns. The first comparison asks how two learners use the same evidence. The second asks how they find it.</figcaption>
</figure>

I would start with the trials where human and model both get the category right. Did they need to see the same part? Two identical answers could conceal a difference in what the learners knew to look for.
