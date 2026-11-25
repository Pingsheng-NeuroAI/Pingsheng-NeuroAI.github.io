---
title: "What changes when you can turn an object over?"
date: 2026-11-25
permalink: /posts/2026/11/learning-to-recognize-objects-in-vr/
excerpt: "At SilicoLabs I built a VR task where people could turn unfamiliar objects before classifying them. What would a vision model learn from the views they chose?"
tags:
  - visual learning
  - virtual reality
---

Imagine trying to recognize an unfamiliar object from a photograph. A small projection on its side might be a pointed tip seen head-on or a rounded bump. If you could pick up the object, a quarter turn might settle it. In a photograph, someone else has already chosen the angle. During my summer 2024 internship at SilicoLabs, I built a Unity experiment around that difference. I wanted to know how to compare a person and a vision model when the person gets to decide what to look at next.

## Giving the learner a turn

My starting point was an experiment by Michael Lee and James DiCarlo. On each trial, a person saw an image of one of two unfamiliar objects for about 200 milliseconds, pressed a key, and learned whether the choice was correct. Object pose, scale, and background varied across trials. The researchers found that a model with a fixed visual representation could capture much of the human learning pattern by updating the weights it used to choose between the two objects. The participant and the model both had to work with the view the experiment supplied. [Lee and DiCarlo, 2023](https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1011713)

In the task I built, the participant could manipulate a 3D object with their hands or controllers for up to ten seconds. They could answer as soon as they had seen enough. A button press selected one of two categories, and feedback told them whether they were right. I also built the data collection and analysis pipeline for the task. [Watch the VR task demo](https://docs.google.com/file/d/1JpHDMvxN1dOhTFxCJ_DOXbYoLr2sHryY/preview)

## Which part gives it away?

We used *Greebles*, a family of unfamiliar 3D objects that Isabel Gauthier and Michael Tarr used to study visual expertise. Look at the six examples below and try to find a feature that separates the three on the left from the three on the right. The overall silhouette is tempting, but body shape varies within each group. Two smaller parts, called a *boge* and a *quiff*, carry information about the category. A participant who discovers a useful viewing angle for one of those parts can try that angle again on the next object. [Gauthier and Tarr, 1997](https://www.sciencedirect.com/science/article/pii/S0042698996002866)

<figure>
  <img src="{{ '/images/silicolabs/greeble-classes.webp' | relative_url }}" width="1177" height="378" alt="Six purple Greebles in two groups of three, with red ovals around the differently shaped protrusions on their heads.">
  <figcaption>Three examples from each category. The red ovals mark the parts used to define the categories in this version of the task. Adapted from slide 17 of my internship talk.</figcaption>
</figure>

The design gave us a way to test what a person had learned. We could train them on three body shapes, then ask them to classify Greebles with two body shapes they had never seen. Someone relying on a familiar silhouette would lose that cue. Someone who had learned the shape of the quiff could still use it.

In my internship presentation I showed two preliminary learning curves. One participant hovered around half correct for much of the session. The other reached about three-quarters correct. An accuracy curve alone cannot tell me which feature either person used. That made me wonder whether the order of training matters. Would learning to distinguish the easier quiffs first help someone pick up the more subtle difference between boges?

<figure class="half">
  <img src="{{ '/images/silicolabs/pilot-participant-0.jpg' | relative_url }}" width="576" height="453" loading="lazy" alt="Participant 0’s accuracy fluctuates around one-half and finishes near 0.42 after roughly 100 trials.">
  <img src="{{ '/images/silicolabs/pilot-participant-1.jpg' | relative_url }}" width="567" height="453" loading="lazy" alt="Participant 1’s accuracy rises after an early dip and finishes near 0.77 after just over 50 trials.">
  <figcaption>Two individual pilot sessions from slide 19. The original plots use different scales on both axes. They show how accuracy changed within each session.</figcaption>
</figure>

## Giving a model the same views

The part I find most interesting is what counts as one example. In the original task, a trial supplied one image. In VR, a single trial could supply a sequence of views, all ending in one decision. A person who turns the object until the quiff comes into profile has already done some of the work that makes the category easy to read out.

I proposed replaying a participant’s sequence of views to a model with a fixed visual encoder and a trainable classifier. With the same views in the same order, we could ask how closely the model follows the person’s learning curve. A second comparison would let a reinforcement learning agent choose its own views. Then we could ask whether it turns the object toward the same feature, even on trials when both learners give the right answer.

That is what I would want to know about two learners who reach the same score. Did they recognize the object from the same evidence, or did one of them know where to look? [Original internship slides](https://docs.google.com/presentation/d/1VmGrR17cVZlyfgYg2xYyWIM7idFeOlNlfViOxKxuVQw/edit?usp=sharing)
