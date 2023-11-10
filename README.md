# Audio Visualizer
https://rlnb2022.github.io/audio-visualizer/index.html

# Project Description

I created this fun project to learn about the canvas and the HTML audio element. I've seen visualizers before and wanted to challenge myself to make one myself. To depict audio playing, I chose a spinning record. To show the audio visualizations, I wanted them to go completely around the record showing different colors as the frequencies changed. Adding a nice background color effect completed the challenge for me. Click the Choose a Song button to find a mp3 to load. Once loaded, click anywhere on the canvas to spin the record and listen to the song.

(I tried to tone down the effect by lowering the opacity, so the background color changes weren't so jarring)

# Technologies Used

This project is created with:

* Canvas
* HTML Audio Element
* HTML 5
* CSS 3
* Javascript
* jsMediaTags - to get the metadata from the mp3

# Problems Faced

* I had to figure out how to draw each item I wanted on the screen, this included arcs, lines and text.
* Some of the lines were not as 'strong' as others and would not display from behind the record. So, I had to create a minimum/maximum line length so that they would display properly.
* I was getting errors when trying to play the song selected before it loaded, until I understood that I needed to resume the context, then toggle the Audio to play.

# What I learned

* I think I'd like to learn more about canvas and what else I can do with it. I'd love to create options for other audio visualizations, like graphics and effects that remain on screen then within a few seconds - fade away.
* I learned about saving and restoring the canvas so that I can make rotational changes, then put the canvas back to its original orientation so that other drawing methods will render correctly.
* This project brought out my creative side. Adding the BG effect was something I thought would be interesting to see. I had to figure out how to change the background color dynamically, so I chose to add RGB based on the audio frequency.

# Takeaways

* 

Thanks for reading!
