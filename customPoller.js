window.optlyUtils = {
    // Takes an array of css selectors and/or functions
    // Takes a callback function to run once they are all found
    // Default timeout of 15 seconds. (Optional param)
    // Default starting interval of 0.1 seconds. (Optional param)
    poll: function (elemArr, callback, timeout = 15000, startInterval = 100) {
        const _this = this,
            startTime = Number(new Date()),
            endTime = startTime + timeout;

        let interval = startInterval;
        // Checks if polled for elements are returned and fires callback
        const checkElements = () => {
            // gets matched values or false
            const returnedValues = _this.findElements(elemArr);
            // If variable holds an array of values fire callback and pass in the array
            if (returnedValues) {
                callback(returnedValues);
            //Runs check again if elements aren't found and timeout is not reached
            } else if (Number(new Date()) < endTime) {
                setTimeout(checkElements, interval);
            }
            // Runs the poller at a rate of 10 times a second for 2 seconds and then gradually slows down
            if ((Number(new Date()) - startTime) / 1000 >= 2) interval *= 1.2;
        }
        // Runs the initial check
        checkElements();
    },
    
    //Takes array of selectors/functions and returns array of elements or false
    findElements: function (elemArr) {
        let allMatchesFound = true;
        const matches = [];
        const isOptlyPreview = document.cookie.indexOf('optimizelyPreview') !== -1;

        // Checks user passes an Array into the poller
        if (Array.isArray(elemArr)) {
            if (elemArr.length === 0) {
                if (isOptlyPreview) console.error('The array is empty. It must contain at least one css selector or function.');
                return;
            }
            // Loops through selectors/functions
            for (let i = 0; i < elemArr.length; i++) {
                // Holds either a NodeList if passed a selector or function
                const query = typeof elemArr[i] === 'string' ? document.querySelectorAll(elemArr[i]) : elemArr[i];

                // Runs for selectors passed into poller
                if (NodeList.prototype.isPrototypeOf(query)) {
                    if (query.length) {
                        // If list is just 1 only push the DomNode into array, otherwise push the NodeList
                        matches.push(query.length > 1 ? query : query[0]);
                    } else {
                        allMatchesFound = false;
                    }
                    // Runs for functions passed into poller
                } else {
                    let funcResult;
                    // Stops any errors when executing the function from breaking the js
                    try {
                        funcResult = elemArr[i]();
                    }
                    // Logs out function error to console when in optimizely preview. 
                    catch (err) {
                        if (isOptlyPreview) console.error(err);
                    }
                    finally {
                        // If function returns a truthy value push to array
                        if (funcResult) {
                            matches.push(funcResult);
                        } else {
                            allMatchesFound = false;
                        }
                    }
                }
            }
        // Logs out an error in optimizely preview to provide an array
        } else {
            if (isOptlyPreview) console.error('The poller requires an Array containing at least one css selector or function.');
        }

        // returns to poller to be passed into callback as a parameter
        return allMatchesFound && matches.length > 0 ? matches : false;
    },
    
    // Sets elements globally when wanting to use the elements across js files within the experience
    setElements: function (objName, obj) {
        window.objName = window.objName || {};
        window[objName] = obj;
    }
}