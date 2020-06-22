let input, button, sampleButton;
let givenPointsX = [], givenPointsY = [], 
    samplePointsX = [], samplePointsY = [],
    samplePoints = [], numPoints = 0, countPoints = 0,
    segmentedX = [], segmentedY = [],
    errors, c = 1;
let randomSize = 50;
let state = "starting";

function setup() { 
    createCanvas(1200, 540);

    input = createInput();
    input.position(10,60);

    button = createButton('submit');
    button.position(input.x + input.width, 60);
    button.mousePressed(startToWrite);
    
    let numPointsInput = createElement('h2', 'Number of points');
    numPointsInput.position(20,0);
    
    sampleButton = createButton('sample');
    sampleButton.position(input.x, 500);
    sampleButton.mousePressed(sample);

    slsButton = createButton('Segmented Least Squares');
    slsButton.position(input.x, sampleButton.y + sampleButton.height);
    slsButton.mousePressed(segmentedLeastSquares);

} 

function draw() { 
    background(220);
    for (let i = 1; i<givenPointsX.length; i++) {
        stroke('purple');
        strokeWeight(10);
        point(givenPointsX[i],givenPointsY[i]);
        if(i<givenPointsX.length-1 && givenPointsX.length > 1){
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
}

function startToWrite() {
    countPoints = -1;
    numPoints = input.value();
    input.value('');
    state = "drawing";
    givenPointsX = [];
    givenPointsY = [];
    samplePointsX = [];
    samplePointsY = [];
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
    let actual = givenPointsX[2];
    let actual_idx = 2;
    for (let i = 0; i<randomSize; i++) {
        let x = givenPointsX[1] + i*(givenPointsX[givenPointsX.length-1] - givenPointsX[1])/(randomSize);
        
        let y = (givenPointsY[actual_idx]-givenPointsY[actual_idx-1])/(givenPointsX[actual_idx]-givenPointsX[actual_idx-1])*(x-givenPointsX[actual_idx-1])+givenPointsY[actual_idx-1];
        //y = 200;
        if ( x >= actual) {
            actual = givenPointsX[++actual_idx];
        }
        samplePointsX.push(x/*+random(-15,15)*/);
        samplePointsY.push(y+random(-15,15));
    }
    console.log(samplePointsX.length + " " + samplePointsY.length);
    state = "showpoints";
}

function segmentedLeastSquares() {
    errors = new Array(randomSize);
    let M = [];
    for(let i = 0; i<randomSize; ++i) {
        errors[i] = new Array(randomSize);
    }
    for( let i = 0; i<randomSize; ++i) {
        for (let j=0; j<randomSize; ++j) {
            errors[i][j] = Number.POSITIVE_INFINITY;
        }
    }

    for ( let i = 0; i<randomSize; ++i) {
        for (let j = 0; j<i; ++j) {
            // Variables for calculating errors for each pair of points
            let xSum = 0, ySum = 0, xSSum = 0,  xySum = 0;
            for (let k = j; k<i; ++k) {
                xSum = xSum + samplePointsX[k];
                ySum = ySum + samplePointsY[k];
                xSSum = xSSum + sq(samplePointsX[k]);
                xySum = xySum + samplePointsX[k]*samplePointsY[k];
            }
            n = i - j;
            a = (n*xySum - xSum*ySum)/(n*xSSum - xSum*xSum);
            b = (ySum - a*xSum)/n;
            errors[i][j] = 0;
            for (let k = j; k<i; ++k) {
                errors[i][j] = errors[i][j] + sq(samplePointsY[k] - a*samplePointsX[i] - b);
            }
            //console.log("errors " + i + " " + j + " " + errors[i][j]);
        }
    }

    M[0] = 0;
    for (let j=1; j<=randomSize; ++j) {
        // Minimum of errors
        let m = Number.POSITIVE_INFINITY;
        for (let i=0; i<j; i++) {
            let aux = errors[i][j] + c + M[i-1]; 
            m = min(m, aux);
        }
        M[j] = m;
        console.log("min " + j + " : " + m);
    }
    console.log(Number.POSITIVE_INFINITY);
}



