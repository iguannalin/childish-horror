let colors = {
    text: 'black',
    accent: '#FFC107',
    background: '#006F23',
    overlay: 'rgba(0, 111, 35, 0.1)',
    // overlay: '255, 255, 255, 0.3',
};

let sizes = {
    small: 20,
    regular: 24,
    large: 48
};

let prompt = "write a text-based horror adventure prompt, with 2-3 choices numbered";
let test = `write a text-based horror adventure prompt, with 2-3 choices numbered

You wake up in a strange room with no windows and one door. 

	1	Examine the room for clues
2. Try the door
3. Scream for help

Try the door
You cautiously approach the door and reach for the handle. The door is locked. 

	1	Look for a key
2. Try to break down the door
3. Scream for help

Scream for help
You call out for help, but the only response is a deep, menacing laugh from somewhere in the room. 

	1	Hide
2. Search the room for the source of the laugh
3. Try to break down the door

Search the room for the source of the laugh
You slowly move around the room, searching for the source of the laugh. You finally find it: a tall figure in a dark cloak standing in the corner of the room. 

	1	Run for the door
2. Talk to the figure
3. Attack the figure

Scream for help
You call out for help, but the only response is a deep, menacing laugh from somewhere in the room. 

	1	Hide
2. Search the room for the source of the laugh
3. Try to break down the door

Search the room for the source of the laugh
You slowly move around the room, searching for the source of the laugh. You finally find it: a tall figure in a dark cloak standing in the corner of the room. 
`;
let choices = {};
let incoming;
let storyText;
let chindex = 1; // character index
let frindex = 30; // frame index
let isLoading = true;
let isKeyPressed = false;
let isTesting = false;
let isGlitching = 7;
let saveButton, refreshButton, readmeButton;
let iconDescriptions = ["Save", "Replay", "About"];
let instructions = "Use the 1, 2, or 3 keys on the keyboard to select a choice when they appear.";

function preload() {
    getAICompletion();
    // Windows icons from https://win98icons.alexmeub.com/
    saveButton = createImg("https://win98icons.alexmeub.com/icons/png/printer-0.png", "printer icon");
    saveButton.attribute("title", "Click to email adventure as text file.");
    saveButton.class("ninetyfive-button");
    saveButton.mousePressed(() => {
        // window.open('mailto:test@example.com?subject=subject&body=body');
        saveStrings(storyText.replace(prompt, "ai-loves-horror").split("/n"), 'ai-loves-horror-adventure.txt');
    });

    refreshButton = createImg("https://win98icons.alexmeub.com/icons/png/netmeeting-0.png", "refresh icon");
    refreshButton.attribute("title", "Click to replay.");
    refreshButton.class("ninetyfive-button");
    refreshButton.mousePressed(() => {
        location.reload();
    });

    readmeButton = createImg("https://win98icons.alexmeub.com/icons/png/file_question.png", "readme icon");
    readmeButton.attribute("title", "Click to read more about this project.");
    readmeButton.class("ninetyfive-button");
    readmeButton.mousePressed(() => {
        open("https://iguannalin.github.io/ai-loves-horror/about.html");
    });

    [saveButton, refreshButton, readmeButton].forEach((btn) => { btn.hide(); });
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(colors.background);
}

function draw() {
    if (!storyText || isLoading) {
        background(colors.overlay);
        push();
            fill(colors.accent);
            textSize(sizes.regular);
            textAlign(CENTER);
            translate(width/2, height - 50);
            text("Loading...", 0, 0);
        pop();
        return;
    }
    if (random() > 0.45) { // random white overlay to make text blurred in background
        background(colors.overlay);
    } else { // otherwise clear canvas
        // clear();
        background(colors.background);
    }
    fill(colors.text);
    let padding = width / 5;
    let pWidth = width - padding;
    let pHeight = height - padding;
    let story = storyText.replace(prompt, instructions);
    textWrap(WORD);
    textFont("Times New Roman");
    textSize(sizes.large);
    textAlign(LEFT, BOTTOM);
    text(story.substring(0, chindex), 60, 0, width > 600 ? pWidth : width - 60, pHeight);
    if (chindex < story.length) {
        chindex++;
        drawGlitch();
        frameRate(random(10, frindex += 0.2));
    }
    if (Object.keys(choices).length < 1 || isTesting) {
        push();
            fill(colors.accent);
            textSize(sizes.regular);
            textAlign(CENTER);
            translate(width/2, height - 70);
            text("\nThere are no choices left.", 0, 0);
        pop();
        let btnX = 150;
        let btns = [saveButton, refreshButton, readmeButton];
        push();
            fill(colors.accent);
            textSize(sizes.small);
            textAlign(CENTER);
            for (let i = 0; i < 3; i++) {
                let btn = btns[i];
                btn.position(((width*3)/5) + btnX, height - 100);
                text(iconDescriptions[i], ((width*3)/5) + btnX + 10, height - 30);
                btnX += 90;
                btn.show();
            }
        pop();
    }
    // frameRate(100);
}

function getAICompletion() {
    isLoading = true;
    if (isTesting) {
        incoming = test;
        getChoices(storyText ? incoming.substring(storyText.length) : incoming); // get choices from most recent text
        storyText = incoming;
        setTimeout(() => {
            isLoading = false;
            clearTimeout();
        }, 500);
        return;
    }
    fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization:
                `Bearer sess-LIrnnnRj9XW9C1tuVRdCiKZVCSJYCle2p9WaCpQK`,
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: (storyText ? storyText : prompt),
            max_tokens: 256,
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            best_of: 1,
            echo: true,
            logprobs: 0
        }),
    })
        .then((r) => r.json())
        .then((d) => {
            let _text = d.choices[0].text;
            incoming = storyText ? _text.substring(storyText.length) : _text;
            getChoices(incoming); // get choices from most recent text
            storyText = _text;
            isLoading = false;
            isKeyPressed = false;
            // print({ storyText });
        });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
    let newPrompt;
    if (isLoading || isKeyPressed) return;
    switch (keyCode) {
        case 49:
            if (choices[1]) newPrompt = choices[1];
            break;
        case 97:
            if (choices[1]) newPrompt = choices[1];
            break;
        case 50:
            if (choices[2]) newPrompt = choices[2];
            break;
        case 98:
            if (choices[2]) newPrompt = choices[2];
            break;
        case 51:
            if (choices[3]) newPrompt = choices[3];
            else alert("please choose a valid choice");
            break;
        case 99:
            if (choices[3]) newPrompt = choices[3];
            else alert("please choose a valid choice");
            break;
        default:
            break;
    }
    // print(prompt);
    if (newPrompt) { // if user chose a valid choice, add choice to current story and send it back to API
        isKeyPressed = true;
        storyText += "\n\n" + newPrompt + "\n";
        push();
            fill(colors.accent);
            textSize(sizes.regular);
            textAlign(CENTER);
            translate(width/2, height - 75);
            text(newPrompt, 0, 0);
        pop();
        getAICompletion();
    }
}

function getChoices(inText) {
    if (!inText) return;
    choices = {};
    let spl = inText.split(/\n[1-3][.]*/g); // capture the string after [1-3].
    for (let i = 1; i < 4; i++) {
        if (spl[i]) choices[i] = spl[i]; // if it exists assign it to choices
    }
    if (!choices[1] || !choices[2]) location.reload(); // if there are no choices 1-2, reload sketch
    // print({ choices });
}

function drawGlitch() {
    if (random() > 0.998 || isGlitching < 7) {
        isGlitching = isGlitching === 0 ? 7 : isGlitching - 1;
        for (let i = 0; i < 75; i++) {
            let sq = random(5, 11);
            push();
            stroke('rgba(163,255,197,0.56)');
            fill('rgba(158,158,158,0.64)');
            if (random() > 0.99) fill('rgba(75,75,75,0.55)');
            rect(random(0, width), random(0, height), sq, sq);
            pop();
        }
    }
}
