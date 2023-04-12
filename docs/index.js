let colors = {
    text: 'black',
    accent: '#FFC107',
    background: '#006F23',
    overlay: 'rgba(0, 111, 35, 0.1)'
};

let sizes = {
    small: 20,
    regular: 30,
    large: 52
};

let vtfont;
let incoming;
let storyText;
let chindex = 1; // character index
let frindex = 50; // frame index
let isLoading = true;
let isKeyPressed = false;
let isTesting = true;
let isGlitching = 7;
let refreshButton, readmeButton;
let iconDescriptions = ["Replay", "About"];
let singleTap = 0;

let prompt = "write me an artist statement to apply to donald glover's ui engineer role";

function preload() {
    getAICompletion();
    vtfont = loadFont('assets/VT323-Regular.ttf');
    // Windows icons from https://win98icons.alexmeub.com/
    refreshButton = createImg("https://win98icons.alexmeub.com/icons/png/netmeeting-0.png", "refresh icon");
    refreshButton.attribute("title", "Click to replay.");
    refreshButton.class("ninetyfive-button");
    refreshButton.mousePressed(() => {
        location.reload();
    });

    readmeButton = createImg("https://win98icons.alexmeub.com/icons/png/file_question.png", "readme icon");
    readmeButton.attribute("title", "Click to read more from this arist.");
    readmeButton.class("ninetyfive-button");
    readmeButton.mousePressed(() => {
        open("https://annaylin.com/");
    });

    [refreshButton, readmeButton].forEach((btn) => { btn.hide(); });
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
    let story = storyText;

    textWrap(WORD);
    textFont(vtfont);
    textSize(sizes.large);
    strokeWeight(.5);
    stroke('blue');
    textAlign(LEFT, BOTTOM);
    text(story.substring(0, chindex), 60, 0, width > 600 ? pWidth : width - 60, pHeight);
    if (chindex < story.length) {
        chindex++;
        drawGlitch();
        frameRate(random(frindex-10, frindex += 0.2));
    }
    if (isTesting && chindex >= story.length - 200) {
        push();
        fill(colors.accent);
        textSize(sizes.regular);
        textAlign(CENTER);
        translate(width/2, height - 70);
        pop();
        let btnX = 150;
        let btns = [refreshButton, readmeButton];
        push();
        fill(colors.accent);
        textSize(sizes.small);
        textAlign(CENTER);
        for (let i = 0; i < 2; i++) {
            let btn = btns[i];
            btn.position(((width*3)/5) + btnX, height - 100);
            text(iconDescriptions[i], ((width*3)/5) + btnX + 15, height - 30);
            btnX += 90;
            btn.show();
        }
        pop();
    }
}

function getAICompletion() {
    isLoading = true;
    if (isTesting) {
        incoming = prompt + '\n\n' + `As an artist with a passion for technology and innovation, I am excited to apply for the UI Engineer role with Donald Glover's team. Throughout my career, I have honed my skills in design and development, combining my artistic sensibilities with a deep understanding of user experience and functionality.

My approach to UI engineering is informed by my background in the arts, which has instilled in me a keen eye for detail and a drive to create beautiful, intuitive interfaces. I believe that great design is not just about aesthetics, but about creating an experience that feels seamless and effortless for the user.

At the same time, I recognize the importance of technology in shaping the world around us. In my work as a UI engineer, I am always seeking out new tools and techniques to improve the user experience and create cutting-edge interfaces that push the boundaries of what is possible.

Ultimately, I am driven by a desire to create work that is both functional and inspiring, bridging the gap between art and technology to create experiences that delight and engage users. I believe that Donald Glover's team embodies this same spirit of innovation and creativity, and I am eager to bring my skills and experience to the table to help drive the team forward.`;

        getChoices(storyText ? incoming.substring(storyText.length) : incoming); // get choices from most recent text
        storyText = incoming;
        isLoading = false;
        return;
    }

    fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization:
                "Bearer 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",
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
            // print({ storyText });
        });
}

function tapped() {
    if (singleTap < 2) {
        frindex = 200;
        return singleTap++;
    }
    chindex = storyText.length;
}

mousePressed = () => tapped();
mouseClicked = () => tapped();

function keyPressed() {
    let newPrompt;
    switch (keyCode) {
        case 49:
            if (choices[1]) newPrompt = choices[1];
            break;
        case 50:
            if (choices[2]) newPrompt = choices[2];
            break;
        case 51:
            if (choices[3]) newPrompt = choices[3];
            else alert("choose a valid choice between 1-3");
            break;
        default:
            break;
    }
    // print(prompt);
    if (newPrompt) {
        storyText += "\n\n" + newPrompt + "\n";
        getAICompletion();
    }
}

function getChoices(inText) {
    if (!inText) return;
    let spl = inText.split(/\n[1-3][.]*/g);
    for (let i = 1; i < 4; i++) {
        if (spl[i]) choices[i] = spl[i];
    }
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
