# custom-poller

This is a custom utilities file that i wrote when working with the optimizely A/B testing platform at jet2. The utils file contains a poller that takes in css selectors to look for DOM nodes and/or functions that must return a value (mainly used for accessing datalayer values). These elements are then stored and accessed by the window object to be manipulated in a separate js file when serving the user a different experience.
