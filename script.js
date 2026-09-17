/* =====================================================
   ELEMENTS
===================================================== */

const introScreen = document.getElementById("introScreen");
const enterButton = document.getElementById("enterButton");

const navigation = document.getElementById("navigation");

const music = document.getElementById("music");
const musicButton = document.getElementById("musicButton");
const musicLabel = document.getElementById("musicLabel");

const pageNumber = document.getElementById("pageNumber");
const mobilePage = document.getElementById("mobilePage");
const progressBar = document.getElementById("progressBar");

const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");

const chapters = document.querySelectorAll(".chapter");


/* =====================================================
   ENTER EXPERIENCE
===================================================== */

enterButton.addEventListener("click", async () => {

    /*
        Browser autoplay policy:
        Music begins here because this click counts
        as direct user interaction.
    */

    music.volume = 0.42;

    try {

        await music.play();

        musicButton.classList.remove("paused");
        musicLabel.textContent = "ON";

    } catch (error) {

        console.log("Music could not start:", error);

        musicButton.classList.add("paused");
        musicLabel.textContent = "OFF";
    }


    introScreen.classList.add("exit");

    navigation.classList.add("visible");

    document.body.classList.remove("locked");

    setTimeout(() => {

        introScreen.style.display = "none";

    }, 1200);

});


/* =====================================================
   MUSIC CONTROL
===================================================== */

musicButton.addEventListener("click", async () => {

    if (music.paused) {

        try {

            await music.play();

            musicButton.classList.remove("paused");
            musicLabel.textContent = "ON";

        } catch (error) {

            console.log(error);
        }

    } else {

        music.pause();

        musicButton.classList.add("paused");
        musicLabel.textContent = "OFF";

    }

});


/* =====================================================
   CURRENT PAGE TRACKER
===================================================== */

function updatePage(index) {

    const number = String(index + 1).padStart(2, "0");

    pageNumber.textContent = number;
    mobilePage.textContent = number;

    const percentage =
        ((index + 1) / chapters.length) * 100;

    progressBar.style.width = `${percentage}%`;

}


/* =====================================================
   INTERSECTION OBSERVER
===================================================== */

const pageObserver = new IntersectionObserver(

    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                const index =
                    Array.from(chapters).indexOf(entry.target);

                updatePage(index);

            }

        });

    },

    {
        threshold: 0.55
    }

);


chapters.forEach(chapter => {

    pageObserver.observe(chapter);

});


/* =====================================================
   PAGE NAVIGATION
===================================================== */

function goToChapter(index) {

    if (index < 0) {
        index = 0;
    }

    if (index >= chapters.length) {
        index = chapters.length - 1;
    }

    chapters[index].scrollIntoView({
        behavior: "smooth"
    });

}


/* =====================================================
   MOBILE BUTTONS
===================================================== */

previousButton.addEventListener("click", () => {

    const current =
        chapters.length
        ? chapters.findIndex(
            chapter => {
                const rect =
                    chapter.getBoundingClientRect();

                return (
                    rect.top >= -window.innerHeight * 0.4 &&
                    rect.top <= window.innerHeight * 0.4
                );
            }
        )
        : 0;

    goToChapter(current - 1);

});


nextButton.addEventListener("click", () => {

    let current = 0;

    chapters.forEach((chapter, index) => {

        const rect =
            chapter.getBoundingClientRect();

        if (
            rect.top >= -window.innerHeight * 0.4 &&
            rect.top <= window.innerHeight * 0.4
        ) {
            current = index;
        }

    });

    goToChapter(current + 1);

});


/* =====================================================
   KEYBOARD NAVIGATION
===================================================== */

document.addEventListener("keydown", event => {

    if (
        introScreen.style.display !== "none" &&
        !introScreen.classList.contains("exit")
    ) {
        return;
    }

    if (event.key === "ArrowDown") {

        const current =
            getCurrentChapter();

        goToChapter(current + 1);

    }

    if (event.key === "ArrowUp") {

        const current =
            getCurrentChapter();

        goToChapter(current - 1);

    }

    if (event.code === "Space") {

        event.preventDefault();

        musicButton.click();

    }

});


/* =====================================================
   FIND CURRENT CHAPTER
===================================================== */

function getCurrentChapter() {

    let closest = 0;
    let closestDistance = Infinity;

    chapters.forEach((chapter, index) => {

        const rect =
            chapter.getBoundingClientRect();

        const distance =
            Math.abs(rect.top);

        if (distance < closestDistance) {

            closestDistance = distance;
            closest = index;

        }

    });

    return closest;

}


/* =====================================================
   COMEBACK TYPING EFFECT
===================================================== */

const typingText =
    document.getElementById("typingText");

const messages = [
    "SYSTEM RECOVERED.",
    "BACK TO WORK.",
    "STILL RUNNING.",
    "WE MOVE."
];

let messageIndex = 0;
let characterIndex = 0;
let deleting = false;


function typeEffect() {

    const currentMessage =
        messages[messageIndex];

    if (!deleting) {

        typingText.textContent =
            currentMessage.substring(
                0,
                characterIndex + 1
            );

        characterIndex++;

        if (
            characterIndex === currentMessage.length
        ) {

            deleting = true;

            setTimeout(typeEffect, 1600);

            return;
        }

    } else {

        typingText.textContent =
            currentMessage.substring(
                0,
                characterIndex - 1
            );

        characterIndex--;

        if (characterIndex === 0) {

            deleting = false;

            messageIndex++;

            if (messageIndex >= messages.length) {
                messageIndex = 0;
            }

        }

    }

    setTimeout(
        typeEffect,
        deleting ? 45 : 75
    );

}


typeEffect();


/* =====================================================
   IMAGE PARALLAX
===================================================== */

if (window.innerWidth > 700) {

    window.addEventListener("mousemove", event => {

        const x =
            (event.clientX / window.innerWidth - 0.5);

        const y =
            (event.clientY / window.innerHeight - 0.5);

        const hero =
            document.querySelector(".hero-device");

        if (hero) {

            hero.style.transform =
                `rotate(4deg)
                 translate(${x * 8}px, ${y * 8}px)`;

        }

    });

}


/* =====================================================
   IMAGE ERROR HANDLING
===================================================== */

document.querySelectorAll("img").forEach(image => {

    image.addEventListener("error", () => {

        console.warn(
            "Missing image:",
            image.src
        );

        image.style.background =
            "#1b1b1b";

    });

});


/* =====================================================
   INITIAL STATE
===================================================== */

document.body.classList.add("locked");

music.pause();
music.currentTime = 0;

updatePage(0);