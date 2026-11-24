---
layout: archive
title: "Curriculum Vitae"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

<div class="profile-records profile-records--cv" markdown="1">

<section class="profile-records__group profile-records__education" markdown="1">

Education
---------
{: .profile-records__heading }

* Ph.D. in Computer Science, McGill University, 2025–2030 (expected)
* M.Sc. in Neuro-X; Minor: Data Science, École polytechnique fédérale de Lausanne (EPFL), 2023–2025
* B.Sc. in Neuroscience; Minor: Computer Science, McGill University, 2019–2023

</section>

<section class="profile-records__group">
  <h2 class="profile-records__heading">Publications</h2>
  <ul class="profile-records__list">
    {% assign publications = site.publications | sort: "date" | reverse %}
    {% for record in publications %}
      {% include profile-publication.html record=record %}
    {% endfor %}
  </ul>
</section>

<section class="profile-records__group">
  <h2 class="profile-records__heading">Selected Honors &amp; Awards</h2>
  <ul class="profile-records__honors">
    <li><time datetime="2025-07">July 2025</time><span>Tomlinson Doctoral Fellowship <small>35,000 CAD per year for three years</small></span></li>
    <li><time datetime="2024-01">January 2024</time><span>EPFL Neuro-X Bertarelli Fellowship Finalists</span></li>
    <li><time datetime="2023-06">June 2023</time><span>Dean’s Multidisciplinary Undergraduate Research List</span></li>
    <li><time datetime="2022-05">May 2022</time><span>Science Undergraduate Research Awards (SURA) <small>7,000 CAD</small></span></li>
  </ul>
</section>

</div>
