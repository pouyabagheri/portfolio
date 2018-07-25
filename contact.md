---
layout: page
title: Contact
---

<form method="POST" action="/contactrequest">
    <ul class="flex-outer">
        <li>
            <label for="name">Name</label>
            <input type="text" name="name" placeholder="Your Name" required>
        </li>
        <li>
            <label for="name">Email</label>
            <input type="email" name="email" placeholder="Your Email" required>
        </li>
        <li>
            <label for="name">Message</label>
            <textarea name="message" rows="10" placeholder="Your message" required></textarea>
        </li>
        <li>
            <button type="submit">Submit</button>
        </li>
    </ul>
</form>
