let input, sInput, numSInput, button, sampleButton, setButton, randError;
let givenPointsX = [], givenPointsY = [], 
    samplePointsX = [], samplePointsY = [],
    samplePoints = [], numPoints = 0, countPoints = 0,
    segmentedX = [], segmentedY = [],
    errors, C = 1500, solutionX = [], solutionY = [];
let randomSize = 50;
let state = "starting";

function setup() { 
    createCanvas(1200, 540);

    input = createInput();
    input.position(10,60);

    button = createButton('submit');
    button.position(input.x + input.width, 60);
    button.mousePressed(startToWrite);
    
    let numPointsInput = createElement('h2', 'Number of drawing points');
    numPointsInput.position(20,0);

    sInput = createInput();
    sInput.position(10,220);

    sampleButton = createButton('sample');
    sampleButton.position(sInput.x + sInput.width, sInput.y);
    sampleButton.mousePressed(sample);

    let numInput = createElement('h2', 'Sample error (-e,e)');
    numInput.position(20,160);

    numSInput = createInput();
    numSInput.position(10,140);

    setButton = createButton('set');
    setButton.position(numSInput.x + numSInput.width, numSInput.y)
    setButton.mouseClicked(setRandomSize);

    let sampleInput = createElement('h2', 'Number of sample points');
    sampleInput.position(20,80);

    slsButton = createButton('Segmented Least Squares');
    slsButton.position(input.x, sampleButton.y + sampleButton.height+40);
    slsButton.mousePressed(segmentedLeastSquares);

} 

function setRandomSize() {
    randomSize = numSInput.value();
}

function draw() { 
    background(220);
    for (let i = 1; i<givenPointsX.length; i++) {
        stroke('purple');
        strokeWeight(10);
        point(givenPointsX[i],givenPointsY[i]);
        if(i<givenPointsX.length-1 && givenPointsX.length > 1) {
            stroke(0);
            strokeWeight(3);
            line(givenPointsX[i],givenPointsY[i],givenPointsX[i+1],givenPointsY[i+1]);
        }
    }
    
    strokeWeight(5);
    stroke('red');
    for (let j = 0; j<samplePointsX.length; j++) {
        point(samplePointsX[j], samplePointsY[j]);
    }

    for ( let i = 0; i<solutionX.length-1; i++) {
        stroke('rgba(0,255,0,0.4)');
        strokeWeight(7);
        line(solutionX[i], solutionY[i], solutionX[i+1], solutionY[i+1]);
    }
}

function startToWrite() {
    countPoints = -1;
    numPoints = input.value();
    //input.value('');
    state = "drawing";
    givenPointsX = [];
    givenPointsY = [];
    samplePointsX = [];
    samplePointsY = [];
    solutionX = [];
    solutionY = [];
}

function mouseClicked() {
    if (countPoints < numPoints && state == "drawing") {
        givenPointsX.push(mouseX);
        givenPointsY.push(mouseY);
        countPoints++;
    }
    else if (countPoints == numPoints) {
        state = "sampling"
    }
}

function sample() {
    samplePointsX = [];
    samplePointsY = [];
    solutionX = [];
    solutionY = [];
    randError = sInput.value();
    //sInput.value('');
    let actual = givenPointsX[2];
    let actual_idx = 2;
    for (let i = 0; i<randomSize; i++) {
        let x = givenPointsX[1] + i*(givenPointsX[givenPointsX.length-1] - givenPointsX[1])/(randomSize);
        if ( x > actual) {
            actual = givenPointsX[++actual_idx];
        }
        let y = (givenPointsY[actual_idx]-givenPointsY[actual_idx-1])/(givenPointsX[actual_idx]-givenPointsX[actual_idx-1])*(x-givenPointsX[actual_idx-1])+givenPointsY[actual_idx-1];
        //y = 200;
        samplePointsX.push(x/*+random(-15,15)*/);
        samplePointsY.push(y+random(-randError,randError));
    }
    samplePointsX.push(givenPointsX[givenPointsX.length-1]);
    samplePointsY.push(givenPointsY[givenPointsY.length-1]+random(-randError,randError));
    randomSize++;
    state = "showpoints";
}

function computeError() {

    errors = new Array(randomSize);
    for(let i = 0; i<randomSize; ++i) {
        errors[i] = new Array(randomSize);
    }

    for ( let i = 0; i<randomSize-1; i++) {
        for (let j = i+1; j<randomSize; j++) {
            // Auxiliar variables for calculating errors for each pair of points
            let xSum = 0, ySum = 0, xSSum = 0,  xySum = 0;
            for (let k = i; k<=j; k++) {
                xSum = xSum + samplePointsX[k];
                ySum = ySum + samplePointsY[k];
                xSSum = xSSum + samplePointsX[k]*samplePointsX[k];
                xySum = xySum + samplePointsX[k]*samplePointsY[k];
            }
            let n = j - i +1;
            let a = (n*xySum - xSum*ySum)/(n*xSSum - xSum*xSum);
            let b = (ySum - a*xSum)/n;
            errors[i][j] = 0;
            for (let k = i; k<=j; k++) {
                errors[i][j] = errors[i][j] + sq(samplePointsY[k] - a*samplePointsX[k] - b);
            }
        }
    }
}

function segmentedLeastSquares() {

    computeError()

    let data = [];
    let M = [];
    M[0] = 0;
    M[1] = errors[0][1] + C;
    data[0] = 0;
    data[1] = 0;
    for (let j=2; j<randomSize; j++) {
        // Minimum of errors
        let m = Number.MAX_SAFE_INTEGER;
        for (let i=1; i<j; i++) {
            let aux = errors[i][j] + C + M[i-1];
            if (aux < m) {
                m = aux;
                data[j] = i-1
            }
        }
        M[j] = m;
    }

    computeLines(data);
}

// Auxiliar function for computing the end points of regression segments
function computeLines(data) {
    let aux = randomSize-1, aLast, bLast;
    let orderedData = [];
    orderedData.unshift(randomSize-1);
    while(aux > 0) {
        aux = data[aux];
        orderedData.unshift(aux)
    }
    orderedData.shift();
    orderedData.unshift(-1);

    for ( let i = 0; i<orderedData.length-1; i++) {
        let xSum = 0, ySum = 0, xSSum = 0,  xySum = 0;
        for (let k = orderedData[i]+1; k<=orderedData[i+1]; k++) {
            xSum = xSum + samplePointsX[k];
            ySum = ySum + samplePointsY[k];
            xSSum = xSSum + samplePointsX[k]*samplePointsX[k];
            xySum = xySum + samplePointsX[k]*samplePointsY[k];
        }
        let n = orderedData[i+1] - orderedData[i];

        let a = (n*xySum - xSum*ySum)/(n*xSSum - xSum*xSum);
        let b = (ySum - a*xSum)/n;
        
        let x1 = samplePointsX[orderedData[i]+1];
        let y1 = a*x1+b;

        let x2 = samplePointsX[orderedData[i+1]];
        let y2 = a*x2+b;
        solutionX.push(x1);
        solutionX.push(x2);
        solutionY.push(y1);
        solutionY.push(y2);
    }
    /*solutionX.push(givenPointsX[givenPointsX.length-1]);
    solutionY.push(givenPointsY[givenPointsY.length-1]);*/
}



