WinslowHomerDay
===============

A map showing a day in the life of Winslow Homer, a baby capuchin monkey.  We want to teach people what it's like to be a baby capuchin in an immersive, interactive way, letting them explore using a map, observational data, pictures and videos, and descriptive captions.  We also want to show off all of data that the Lomas Capuchin project collects.




Winslow Homer Day To Do's
=========================

The lines marked with stars *** are tasks with which I could use help from monkey people.



Content (things to do now)
==========================

- *** create about 10 'hilights' of WH's day, with pictures, videos, and text, that you see first when you're zoomed all the way out of the map.

- *** get Irene's psion data and integrate it with Susan's psion data

- 'translate' Irene's psion data into easily-understandable English

- *** go over psion data 'translations,' to make them as clear, understandable, and consise as possible

- *** rank psion data by interestingness or importance, so we can show the most important data on the map when the user is zoomed out



Content (things to do later, once the design is a little bit further along.  We need to make some design decisions about where these things will fit, and we might just decide not to do some of them.)
================================

- maybe create about 10 more sub-hilights, that you see when you zoom in one level

- write a couple paragraphs describing the Lomas Barbudal Capuchin Project that will convince people to check out the website and/or donate

- write a short biography of WH to put somewhere, and maybe biographies of the other monkeys?

- catagorize the Psion data, (eg foraging, social, self-care, approaches and leaves, point samples) so the user can switch on and off different kinds of data on the map



Interface
=========

- play around with colors, spacing and typography to make the map pretty to look at, enforce the visual hierarchy

- show only the most important or interesting psion data when the user is zoomed out, and reveal more detail when the user zooms in

- add some code to play videos and view images full-screen

- figure out what to do when the user zooms in too far and we run out of satelite images (find a higher-resolution tile provider?  don't let the user zoom in that far?  replace the satelite images with a nice background color at high zoom?)

- maybe come up with a better way to minimize overlap between the lables for the Psion data?

- add overlays with some text describing the Lomas Capuchin project, with a donate button, buttons for sharing on twitter/facebook/etc, maybe a short bio of WH



Technical

- figure out how to make Psion layer render quicker (pre-render when the map loads, and then show the already-rendered layer when the user zooms in?)

- fix the bug where the psion data doesn't always get re-clustered when you zoom out, resulting in way too many labels on the map

- fix the annoying CSS problem with the hilight labels

- concatenate and minify javascript files for quicker page load

- come up with a time-efficient way let the user switch on and off different catagories of Psion data (maybe, if we go down this route)
