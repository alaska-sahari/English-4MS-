"use strict";

/* =========================================================
   ENGLISH+
   3 CHAPTERS - 4MS
   Chapter 1 → Chapter 3
========================================================= */
/* =========================================================
   SPEECH RATE
========================================================= */

const speechRate =
  document.getElementById("speechRate");

const speechRateValue =
  document.getElementById("speechRateValue");

const speechRateControl =
  document.getElementById("speechRateControl");
document.addEventListener("click", (event) => {

  if (
    !speechRateControl ||
    speechRateControl.classList.contains("hidden")
  ) {
    return;
  }

  const clickedInsideControl =
    speechRateControl.contains(event.target);

  const clickedSpeakButton =
    DOM.speakBtn?.contains(event.target);

  if (
    !clickedInsideControl &&
    !clickedSpeakButton
  ) {
    speechRateControl.classList.add("hidden");
  }

});

const savedSpeechRate =
  localStorage.getItem(
    "englishPlusSpeechRate"
  ) || "1";


if (speechRate) {

  speechRate.value =
    savedSpeechRate;

}


if (speechRateValue) {

  speechRateValue.textContent =
    `${Number(savedSpeechRate).toFixed(1)}x`;

}


/* إخفاء التحكم عند البداية */

if (speechRateControl) {

  speechRateControl.classList.add(
    "hidden"
  );

}


/* عند تغيير السرعة */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {

    DATA_FILES: {

        chapter1:
            "chapter1.json",

        chapter2:
            "chapter2.json",

        chapter3:
            "chapter3.json"

    },

    STORAGE_KEYS: {

        CHAPTER:
            "english_plus_chapter",

        FAVORITES:
            "english_plus_favorites",

        COMPLETED:
            "english_plus_completed",

        LAST_LESSON:
            "english_plus_last_lesson"

    },

    DEFAULT_CHAPTER:
        "chapter1",

    CHAPTERS: [

        "chapter1",

        "chapter2",

        "chapter3"

    ]

};


/* =========================================================
   APPLICATION STATE
========================================================= */

const AppState = {

    data: {

        chapter1: null,

        chapter2: null,

        chapter3: null

    },

    currentChapter:
        CONFIG.DEFAULT_CHAPTER,

    currentLessonIndex:
        0,

    currentLesson:
        null,

    searchQuery:
        "",

    showFavoritesOnly:
        false,

    favorites:
        [],

    completed:
        [],

    isSpeaking:
        false

};


/* =========================================================
   DOM
========================================================= */

const DOM = {

    app:
        document.getElementById("app"),

    menuBtn:
        document.getElementById("menuBtn"),

    closeMenuBtn:
        document.getElementById("closeMenuBtn"),

    sideMenu:
        document.getElementById("sideMenu"),

    menuOverlay:
        document.getElementById("menuOverlay"),

    searchBtn:
        document.getElementById("searchBtn"),

    searchPanel:
        document.getElementById("searchPanel"),

    searchInput:
        document.getElementById("searchInput"),

    clearSearchBtn:
        document.getElementById("clearSearchBtn"),

    favoritesBtn:
        document.getElementById("favoritesBtn"),

    levelsBtn:
        document.getElementById("levels"),

    levelSection:
        document.querySelector(".level-section"),

    lessonsList:
        document.getElementById("lessonsList"),

    emptyState:
        document.getElementById("emptyState"),

    lessonsTitle:
        document.getElementById("lessonsTitle"),

    lessonsSubtitle:
        document.getElementById("lessonsSubtitle"),

    lessonCount:
        document.getElementById("lessonCount"),

    readerModal:
        document.getElementById("readerModal"),

    modalOverlay:
        document.querySelector(".modal-overlay"),

    closeReaderBtn:
        document.getElementById("closeReaderBtn"),

    readerLevel:
        document.getElementById("readerLevel"),

    readerLessonNumber:
        document.getElementById("readerLessonNumber"),

    readerFavoriteBtn:
        document.getElementById("readerFavoriteBtn"),

    readerTitle:
        document.getElementById("readerTitle"),

    readerTitleAr:
        document.getElementById("readerTitleAr"),

    readerText:
        document.getElementById("readerText"),

    readerTranslation:
        document.getElementById("readerTranslation"),

    speakBtn:
        document.getElementById("speakBtn"),

    stopSpeakBtn:
        document.getElementById("stopSpeakBtn"),

    questionsSection:
        document.getElementById("questionsSection"),

    questionsContainer:
        document.getElementById("questionsContainer"),

    showAnswersBtn:
        document.getElementById("showAnswersBtn"),

    answersContainer:
        document.getElementById("answersContainer"),

    prevLessonBtn:
        document.getElementById("prevLessonBtn"),

    nextLessonBtn:
        document.getElementById("nextLessonBtn"),

    currentPosition:
        document.getElementById("currentPosition"),

    continueMenuBtn:
        document.getElementById("continueMenuBtn"),

    resetProgressBtn:
        document.getElementById("resetProgressBtn"),

    toast:
        document.getElementById("toast"),

    toastMessage:
        document.getElementById("toastMessage")

};


/* =========================================================
   RESET MODAL DOM
========================================================= */

const resetModal =
    document.getElementById(
        "resetModal"
    );

const cancelResetBtn =
    document.getElementById(
        "cancelResetBtn"
    );

const confirmResetBtn =
    document.getElementById(
        "confirmResetBtn"
    );

const resetModalOverlay =
    document.getElementById(
        "resetModalOverlay"
    );


/* =========================================================
   THEME
========================================================= */

const themeToggleBtn =
    document.getElementById(
        "themeToggleBtn"
    );


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);


async function init() {

    loadStorage();

    bindEvents();

    await loadAllChapters();

    updateThemeButton();

    updateUI();

}


/* =========================================================
   LOAD ALL CHAPTERS
========================================================= */

async function loadAllChapters() {

    try {

        await Promise.all(

            CONFIG.CHAPTERS.map(

                chapter =>
                    loadChapter(
                        chapter
                    )

            )

        );

        console.log(
            "English+ chapters loaded successfully."
        );

    } catch (error) {

        console.error(
            "Chapter loading error:",
            error
        );

        showDataError();

    }

}


/* =========================================================
   LOAD ONE CHAPTER
========================================================= */

async function loadChapter(
    chapter
) {

    const file =
        CONFIG.DATA_FILES[
            chapter
        ];


    if (!file) {

        throw new Error(
            `No data file configured for ${chapter}`
        );

    }


    const response =
        await fetch(
            file,
            {
                cache:
                    "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(

            `Failed to load ${file}: ${response.status}`

        );

    }


    const data =
        await response.json();


    AppState.data[
        chapter
    ] =
        normalizeChapterData(
            data,
            chapter
        );

}


/* =========================================================
   NORMALIZE CHAPTER DATA
========================================================= */

function normalizeChapterData(
    data,
    chapter
) {

    /*
       Supports:

       {
           "chapter": "chapter1",
           "title": "الفصل الأول",
           "lessons": []
       }

       Also supports direct array:

       []
    */


    if (Array.isArray(data)) {

        return {

            chapter:
                chapter,

            title:
                getChapterTitle(
                    chapter
                ),

            lessons:
                data

        };

    }


    if (
        !data ||
        typeof data !== "object"
    ) {

        return {

            chapter:
                chapter,

            title:
                getChapterTitle(
                    chapter
                ),

            lessons:
                []

        };

    }


    return {

        chapter:
            data.chapter ||
            chapter,

        title:
            data.title ||
            getChapterTitle(
                chapter
            ),

        lessons:

            Array.isArray(
                data.lessons
            )

                ? data.lessons

                : []

    };

}


/* =========================================================
   STORAGE
========================================================= */

function loadStorage() {

    const savedChapter =
        localStorage.getItem(
            CONFIG.STORAGE_KEYS.CHAPTER
        );


    if (
        CONFIG.CHAPTERS.includes(
            savedChapter
        )
    ) {

        AppState.currentChapter =
            savedChapter;

    }


    AppState.favorites =
        loadArrayFromStorage(

            CONFIG.STORAGE_KEYS.FAVORITES

        );


    AppState.completed =
        loadArrayFromStorage(

            CONFIG.STORAGE_KEYS.COMPLETED

        );

}


function loadArrayFromStorage(
    key
) {

    try {

        const value =
            JSON.parse(

                localStorage.getItem(
                    key
                )

            );


        if (
            Array.isArray(value)
        ) {

            return value.map(
                String
            );

        }

    } catch (error) {

        console.warn(

            `Invalid storage data: ${key}`,

            error

        );

    }


    return [];

}


function saveStorage() {

    localStorage.setItem(

        CONFIG.STORAGE_KEYS.CHAPTER,

        AppState.currentChapter

    );


    localStorage.setItem(

        CONFIG.STORAGE_KEYS.FAVORITES,

        JSON.stringify(
            AppState.favorites
        )

    );


    localStorage.setItem(

        CONFIG.STORAGE_KEYS.COMPLETED,

        JSON.stringify(
            AppState.completed
        )

    );

}


/* =========================================================
   EVENTS
========================================================= */

function bindEvents() {

    /* MENU */

    DOM.menuBtn?.addEventListener(

        "click",

        openMenu

    );


    DOM.closeMenuBtn?.addEventListener(

        "click",

        closeMenu

    );


    DOM.menuOverlay?.addEventListener(

        "click",

        closeMenu

    );


    /* SEARCH */

    DOM.searchBtn?.addEventListener(

        "click",

        toggleSearch

    );


    DOM.searchInput?.addEventListener(

        "input",

        handleSearch

    );


    DOM.clearSearchBtn?.addEventListener(

        "click",

        clearSearch

    );


    /* FAVORITES */

    DOM.favoritesBtn?.addEventListener(

        "click",

        toggleFavorites

    );


    /* CHAPTERS */

    DOM.levelsBtn?.addEventListener(

        "click",

        toggleChapters

    );


    DOM.levelSection?.addEventListener(

        "click",

        handleChapterClick

    );


    /* READER */

    DOM.closeReaderBtn?.addEventListener(

        "click",

        closeReader

    );


    DOM.modalOverlay?.addEventListener(

        "click",

        closeReader

    );


    DOM.readerFavoriteBtn?.addEventListener(

        "click",

        toggleCurrentFavorite

    );


    DOM.speakBtn?.addEventListener(

        "click",

        speakCurrentLesson

    );


    DOM.stopSpeakBtn?.addEventListener(

        "click",

        stopSpeaking

    );


    DOM.showAnswersBtn?.addEventListener(

        "click",

        toggleAnswers

    );


    DOM.prevLessonBtn?.addEventListener(

        "click",

        previousLesson

    );


    DOM.nextLessonBtn?.addEventListener(

        "click",

        nextLesson

    );


    /* SIDE NAVIGATION */

    document
        .querySelectorAll(
            ".side-nav-item"
        )
        .forEach(

            button => {

                button.addEventListener(

                    "click",

                    handleSideNavigation

                );

            }

        );


    /* CONTINUE */

    DOM.continueMenuBtn?.addEventListener(

        "click",

        continueLastLesson

    );


    /* RESET */

    DOM.resetProgressBtn?.addEventListener(

        "click",

        resetProgress

    );


    /* RESET MODAL */

    cancelResetBtn?.addEventListener(

        "click",

        closeResetModal

    );


    resetModalOverlay?.addEventListener(

        "click",

        closeResetModal

    );


    confirmResetBtn?.addEventListener(

        "click",

        confirmReset

    );


    /* THEME */

    themeToggleBtn?.addEventListener(

        "click",

        toggleTheme

    );


    /* KEYBOARD */

    document.addEventListener(

        "keydown",

        handleKeyboard

    );

}


/* =========================================================
   UI UPDATE
========================================================= */

function updateUI() {

    updateActiveChapter();

    updateFavoritesButton();

    renderLessons();

}


/* =========================================================
   CHAPTER MANAGEMENT
========================================================= */

async function handleChapterClick(
    event
) {

    const button =
        event.target.closest(
            ".level-btn"
        );


    if (!button) {

        return;

    }


    const chapter =
        button.dataset.chapter ||
        button.dataset.level;


    if (
        !CONFIG.CHAPTERS.includes(
            chapter
        )
    ) {

        return;

    }


    AppState.currentChapter =
        chapter;


    AppState.searchQuery =
        "";


    AppState.showFavoritesOnly =
        false;


    if (DOM.searchInput) {

        DOM.searchInput.value =
            "";

    }


    saveStorage();


    updateActiveChapter();

    renderLessons();

    hideChapters();

}


function updateActiveChapter() {

    document
        .querySelectorAll(
            ".level-btn"
        )
        .forEach(

            button => {

                const buttonChapter =

                    button.dataset.chapter ||

                    button.dataset.level;


                const active =

                    buttonChapter ===

                    AppState.currentChapter;


                button.classList.toggle(

                    "active",

                    active

                );


                button.setAttribute(

                    "aria-selected",

                    String(active)

                );

            }

        );


    const title =
        getCurrentChapterTitle();


    if (
        DOM.lessonsTitle &&
        !AppState.showFavoritesOnly
    ) {

        DOM.lessonsTitle.textContent =
            title;

    }

}


function toggleChapters() {

    const isHidden =

        DOM.levelSection?.classList.contains(

            "hidden"

        );


    if (isHidden) {

        showChapters();

    } else {

        hideChapters();

    }

}


function showChapters() {

    DOM.levelSection?.classList.remove(

        "hidden"

    );


    DOM.levelsBtn?.setAttribute(

        "aria-pressed",

        "true"

    );

}


function hideChapters() {

    DOM.levelSection?.classList.add(

        "hidden"

    );


    DOM.levelsBtn?.setAttribute(

        "aria-pressed",

        "false"

    );

}


/* =========================================================
   GET CURRENT CHAPTER
========================================================= */

function getCurrentChapterData() {

    return (

        AppState.data[
            AppState.currentChapter
        ] || {

            chapter:
                AppState.currentChapter,

            title:
                getChapterTitle(
                    AppState.currentChapter
                ),

            lessons:
                []

        }

    );

}


function getCurrentChapterLessons() {

    const chapterData =
        getCurrentChapterData();


    return Array.isArray(

        chapterData.lessons

    )

        ? chapterData.lessons

        : [];

}


function getCurrentChapterTitle() {

    const chapterData =
        getCurrentChapterData();


    return (

        chapterData.title ||

        getChapterTitle(
            AppState.currentChapter
        )

    );

}


/* =========================================================
   FILTER LESSONS
========================================================= */

function getVisibleLessons() {

    let lessons =
        getCurrentChapterLessons();


    /* SEARCH */

    if (
        AppState.searchQuery.trim()
    ) {

        const query =

            AppState.searchQuery

                .toLowerCase()

                .trim();


        lessons =

            lessons.filter(

                lesson => {

                    const title =

                        String(
                            lesson.title ||
                            ""
                        ).toLowerCase();


                    const titleAr =

                        String(
                            lesson.title_ar ||
                            ""
                        ).toLowerCase();


                    const content =

                        String(
                            lesson.content ||
                            ""
                        ).toLowerCase();


                    const translation =

                        String(

                            lesson.translation_ar ||

                            ""

                        ).toLowerCase();


                    return (

                        title.includes(
                            query
                        ) ||

                        titleAr.includes(
                            query
                        ) ||

                        content.includes(
                            query
                        ) ||

                        translation.includes(
                            query
                        )

                    );

                }

            );

    }


    /* FAVORITES */

    if (
        AppState.showFavoritesOnly
    ) {

        lessons =

            lessons.filter(

                lesson =>

                    isFavorite(
                        lesson.id
                    )

            );

    }


    return lessons;

}


/* =========================================================
   RENDER LESSONS
========================================================= */

function renderLessons() {

    const lessons =
        getVisibleLessons();


    updateLessonsHeader(

        lessons.length

    );


    if (
        lessons.length === 0
    ) {

        if (DOM.lessonsList) {

            DOM.lessonsList.innerHTML =
                "";

        }


        DOM.emptyState?.classList.remove(

            "hidden"

        );


        return;

    }


    DOM.emptyState?.classList.add(

        "hidden"

    );


    if (DOM.lessonsList) {

        DOM.lessonsList.innerHTML =

            lessons

                .map(

                    (lesson, index) =>

                        createLessonCard(

                            lesson,

                            index

                        )

                )

                .join("");

    }


    attachLessonEvents();

}


/* =========================================================
   LESSON HEADER
========================================================= */

function updateLessonsHeader(
    count
) {

    if (
        AppState.showFavoritesOnly
    ) {

        DOM.lessonsTitle.textContent =

            "Favorite Lessons";


        DOM.lessonsSubtitle.textContent =

            "Your saved lessons";

    } else {

        DOM.lessonsTitle.textContent =

            getCurrentChapterTitle();


        DOM.lessonsSubtitle.textContent =

            getChapterDescription(

                AppState.currentChapter

            );

    }


    DOM.lessonCount.textContent =

        `${count} ${
            count === 1
                ? "lesson"
                : "lessons"
        }`;

}


/* =========================================================
   LESSON CARD
========================================================= */

function createLessonCard(
    lesson,
    index
) {

    const id =

        String(

            lesson.id ??

            `${AppState.currentChapter}_${index}`

        );


    const completed =
        isCompleted(id);


    const favorite =
        isFavorite(id);


    return `

        <article

            class="
                lesson-card
                ${completed ? "completed" : ""}
                ${favorite ? "is-favorite" : ""}
            "

            data-lesson-id="${escapeAttribute(id)}"

            tabindex="0"

            role="button"

            aria-label="${escapeAttribute(

                lesson.title ||

                "Open lesson"

            )}"

        >

            <div class="lesson-number">

                ${String(

                    index + 1

                ).padStart(

                    2,

                    "0"

                )}

            </div>


            <div class="lesson-info">

                <h3>

                    ${escapeHTML(

                        lesson.title ||

                        "Untitled Lesson"

                    )}

                </h3>


                <p>

                    ${escapeHTML(

                        lesson.title_ar ||

                        ""

                    )}

                </p>

            </div>


            <div class="lesson-status">

                ${

                    completed

                        ? "🖊"

                        : ""

                }

            </div>


            <div class="lesson-favorite">

                ${

                    favorite

                        ? "☆"

                        : ""

                }

            </div>

        </article>

    `;

}


/* =========================================================
   LESSON EVENTS
========================================================= */

function attachLessonEvents() {

    document
        .querySelectorAll(
            ".lesson-card"
        )
        .forEach(

            card => {

                card.addEventListener(

                    "click",

                    () => {

                        openLesson(

                            card.dataset.lessonId

                        );

                    }

                );


                card.addEventListener(

                    "keydown",

                    event => {

                        if (

                            event.key ===
                                "Enter" ||

                            event.key ===
                                " "

                        ) {

                            event.preventDefault();


                            openLesson(

                                card.dataset.lessonId

                            );

                        }

                    }

                );

            }

        );

}


/* =========================================================
   OPEN LESSON
========================================================= */

function openLesson(
    lessonId
) {

    const lessons =
        getCurrentChapterLessons();


    const index =

        lessons.findIndex(

            (lesson, lessonIndex) =>

                String(

                    lesson.id ??

                    `${AppState.currentChapter}_${lessonIndex}`

                ) ===

                String(

                    lessonId

                )

        );


    if (
        index === -1
    ) {

        return;

    }


    AppState.currentLessonIndex =
        index;


    AppState.currentLesson =
        lessons[index];


    renderReader();


    DOM.readerModal?.classList.remove(

        "hidden"

    );


    document.body.style.overflow =
        "hidden";


    saveLastLesson(

        AppState.currentLesson.id,

        AppState.currentChapter

    );

}


/* =========================================================
   RENDER READER
========================================================= */

function renderReader() {

    const lesson =
        AppState.currentLesson;


    if (!lesson) {

        return;

    }


    const lessons =
        getCurrentChapterLessons();


    const index =
        AppState.currentLessonIndex;


    DOM.readerLevel.textContent =

        getCurrentChapterTitle();


    DOM.readerLessonNumber.textContent =

        `Lesson ${index + 1}`;


    DOM.readerTitle.textContent =

        lesson.title ||

        "Untitled Lesson";


    DOM.readerTitleAr.textContent =

        lesson.title_ar ||

        "";


    DOM.readerText.textContent =

        lesson.content ||

        "";


    DOM.readerTranslation.textContent =

        lesson.translation_ar ||

        "No translation available.";


    updateReaderFavoriteButton();


    renderQuestions();


    updateReaderNavigation(

        lessons.length

    );


    markAsCompleted(

        getLessonId(

            lesson,

            index

        )

    );

}


/* =========================================================
   GET LESSON ID
========================================================= */

function getLessonId(
    lesson,
    index
) {

    return String(

        lesson.id ??

        `${AppState.currentChapter}_${index}`

    );

}


/* =========================================================
   QUESTIONS
========================================================= */

/* =========================================================
   QUESTIONS — CLICK TO SHOW ANSWER
========================================================= */

function renderQuestions() {

    const lesson =
        AppState.currentLesson;

    const questions =
        Array.isArray(
            lesson?.questions
        )
            ? lesson.questions
            : [];


    /* إخفاء زر إظهار الإجابات */
    DOM.showAnswersBtn?.classList.add(
        "hidden"
    );


    /* إخفاء حاوية الإجابات القديمة */
    DOM.answersContainer?.classList.add(
        "hidden"
    );


    /* حذف الإجابات القديمة بأمان */
    if (DOM.answersContainer) {

        DOM.answersContainer.innerHTML =
            "";

    }


    /* =====================================================
       NO QUESTIONS
    ===================================================== */

    if (
        questions.length === 0
    ) {

        if (DOM.questionsContainer) {

            DOM.questionsContainer.innerHTML =

                `
                    <p class="no-questions">
                        No questions available.
                    </p>
                `;

        }

        return;

    }


    /* =====================================================
       RENDER QUESTIONS
    ===================================================== */

    DOM.questionsContainer.innerHTML =

        questions

            .map(

                (question, index) => {

                    const text =

                        typeof question ===
                        "string"

                            ? question

                            : question?.question ||
                              "";


                    const answer =

                        typeof question ===
                        "string"

                            ? ""

                            : question?.answer ||
                              "";


                    return `

                        <div
                            class="question-card"
                            data-index="${index}"
                        >

                            <!-- QUESTION -->

                            <div
                                class="question-header"
                                tabindex="0"
                                role="button"
                                aria-expanded="false"
                            >

                                <span class="question-number">

                                    Question ${index + 1}

                                </span>


                                <div
                                    class="question-text"
                                    dir="ltr"
                                >

                                    ${escapeHTML(text)}

                                </div>

                            </div>


                            <!-- USER ANSWER -->

                            <div
                                class="user-answer-section"
                                dir="ltr"
                            >

                                <label>

                                    Your Answer

                                </label>


                                <textarea

                                    class="user-answer-input"

                                    placeholder="Write your answer here..."

                                    rows="3"

                                    spellcheck="true"

                                ></textarea>

                            </div>


                            <!-- CORRECT ANSWER -->

                            <div
                                class="question-answer hidden"
                                dir="ltr"
                            >

                               
                                <div>

                                    ${escapeHTML(answer)}

                                </div>

                            </div>

                        </div>

                    `;

                }

            )

            .join("");


    /* =====================================================
       CLICK ON QUESTION — SHOW CORRECT ANSWER
    ===================================================== */

    DOM.questionsContainer

        .querySelectorAll(
            ".question-header"
        )

        .forEach(

            header => {

                header.addEventListener(

                    "click",

                    () => {

                        const card =
                            header.closest(
                                ".question-card"
                            );


                        const answer =
                            card?.querySelector(
                                ".question-answer"
                            );


                        if (!answer) {

                            return;

                        }


                        const isHidden =

                            answer.classList.contains(
                                "hidden"
                            );


                        answer.classList.toggle(

                            "hidden",

                            !isHidden

                        );


                        header.setAttribute(

                            "aria-expanded",

                            String(isHidden)

                        );


                        card.classList.toggle(

                            "has-answer",

                            isHidden

                        );

                    }

                );


                /* دعم لوحة المفاتيح */

                header.addEventListener(

                    "keydown",

                    event => {

                        if (

                            event.key === "Enter" ||

                            event.key === " "

                        ) {

                            event.preventDefault();

                            header.click();

                        }

                    }

                );

            }

        );

}







/* =========================================================
   READER NAVIGATION
========================================================= */

function updateReaderNavigation(
    totalLessons
) {

    DOM.currentPosition.textContent =

        `${AppState.currentLessonIndex + 1} / ${totalLessons}`;


    DOM.prevLessonBtn.disabled =

        AppState.currentLessonIndex <= 0;


    DOM.nextLessonBtn.disabled =

        AppState.currentLessonIndex >=

        totalLessons - 1;

}


function previousLesson() {

    if (

        AppState.currentLessonIndex <= 0

    ) {

        return;

    }


    AppState.currentLessonIndex--;


    const lessons =
        getCurrentChapterLessons();


    AppState.currentLesson =

        lessons[

            AppState.currentLessonIndex

        ];


    saveLastLesson(

        getLessonId(

            AppState.currentLesson,

            AppState.currentLessonIndex

        ),

        AppState.currentChapter

    );


    renderReader();

}


function nextLesson() {

    const lessons =
        getCurrentChapterLessons();


    if (

        AppState.currentLessonIndex >=

        lessons.length - 1

    ) {

        return;

    }


    AppState.currentLessonIndex++;


    AppState.currentLesson =

        lessons[

            AppState.currentLessonIndex

        ];


    saveLastLesson(

        getLessonId(

            AppState.currentLesson,

            AppState.currentLessonIndex

        ),

        AppState.currentChapter

    );


    renderReader();

}


/* =========================================================
   CLOSE READER
========================================================= */

function closeReader() {

    stopSpeaking();


    DOM.readerModal?.classList.add(

        "hidden"

    );


    document.body.style.overflow =

        "";

}


/* =========================================================
   FAVORITES
========================================================= */

function isFavorite(
    lessonId
) {

    return AppState.favorites.includes(

        String(

            lessonId

        )

    );

}


function toggleFavorite(
    lessonId
) {

    const id =
        String(lessonId);


    if (
        isFavorite(id)
    ) {

        AppState.favorites =

            AppState.favorites.filter(

                item =>

                    item !== id

            );


        showToast(

            "Removed from favorites"

        );

    } else {

        AppState.favorites.push(

            id

        );


        showToast(

            "Added to favorites ⭐"

        );

    }


    saveStorage();


    updateFavoritesButton();


    updateReaderFavoriteButton();


    renderLessons();

}


function toggleCurrentFavorite() {

    if (
        !AppState.currentLesson
    ) {

        return;

    }


    toggleFavorite(

        getLessonId(

            AppState.currentLesson,

            AppState.currentLessonIndex

        )

    );

}


function updateReaderFavoriteButton() {

    if (
        !AppState.currentLesson
    ) {

        return;

    }


    const favorite =

        isFavorite(

            getLessonId(

                AppState.currentLesson,

                AppState.currentLessonIndex

            )

        );


    DOM.readerFavoriteBtn.textContent =

        favorite

            ? "⭐"

            : "☆";


    DOM.readerFavoriteBtn.setAttribute(

        "aria-pressed",

        String(favorite)

    );


    DOM.readerFavoriteBtn.setAttribute(

        "aria-label",

        favorite

            ? "Remove from favorites"

            : "Add lesson to favorites"

    );

}


function toggleFavorites() {

    AppState.showFavoritesOnly =

        !AppState.showFavoritesOnly;


    updateFavoritesButton();


    renderLessons();

}


function updateFavoritesButton() {

    const active =

        AppState.showFavoritesOnly;


    DOM.favoritesBtn.textContent =

        active

            ? "⭐"

            : "☆";


    DOM.favoritesBtn.setAttribute(

        "aria-pressed",

        String(active)

    );

}


/* =========================================================
   COMPLETED LESSONS
========================================================= */

function isCompleted(
    lessonId
) {

    return AppState.completed.includes(

        String(lessonId)

    );

}


function markAsCompleted(
    lessonId
) {

    const id =
        String(lessonId);


    if (
        isCompleted(id)
    ) {

        return;

    }


    AppState.completed.push(

        id

    );


    saveStorage();

}


/* =========================================================
   SEARCH
========================================================= */

function toggleSearch() {

    const hidden =

        DOM.searchPanel

            .classList

            .contains(

                "hidden"

            );


    DOM.searchPanel

        .classList

        .toggle(

            "hidden",

            !hidden

        );


    DOM.searchBtn?.setAttribute(

        "aria-expanded",

        String(hidden)

    );


    if (hidden) {

        DOM.searchInput?.focus();

    }

}


function handleSearch(
    event
) {

    AppState.searchQuery =

        event.target.value;


    AppState.showFavoritesOnly =

        false;


    updateFavoritesButton();


    renderLessons();

}


function clearSearch() {

    DOM.searchInput.value =

        "";


    AppState.searchQuery =

        "";


    renderLessons();

}


/* =========================================================
   TEXT TO SPEECH
========================================================= */
/* =========================================================
   TEXT TO SPEECH
========================================================= */

function speakCurrentLesson() {

    if (!AppState.currentLesson) {
        return;
    }
if (
    !window.speechSynthesis ||
    typeof window.speechSynthesis.speak !== "function"
) {
    showToast(
        "Text-to-Speech is not available on this device."
    );
    return;
}



const text =
        AppState.currentLesson.content || "";

    if (!text.trim()) {

        showToast(
            "No text available."
        );

        return;
    }

    /*
       إيقاف القراءة السابقة فقط
       بدون إخفاء سرعة القراءة
    */
    window.speechSynthesis.cancel();

    /*
       إظهار التحكم في سرعة القراءة
    */
    if (speechRateControl) {

        speechRateControl.classList.remove(
            "hidden"
        );

    }

    const utterance =
        new SpeechSynthesisUtterance(
            text
        );

    utterance.lang =
        "en-US";

    utterance.rate =
        Number(
            speechRate?.value || 1
        );

    utterance.pitch =
        1;

    utterance.onstart = () => {

        AppState.isSpeaking =
            true;

        if (DOM.speakBtn) {

            DOM.speakBtn.innerHTML = `

                <span class="speak-icon">
                    🔊
                </span>

                <span>
                    Speaking...
                </span>

            `;

        }

    };

    utterance.onend = () => {

        resetSpeechButton();

    };

    utterance.onerror = () => {

        resetSpeechButton();

    };

    window.speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   STOP SPEAKING
========================================================= */

function stopSpeaking() {

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();

    }

    /*
       لا نخفي speechRateControl هنا
       حتى تبقى سرعة القراءة ظاهرة
    */

    resetSpeechButton();

}


/* =========================================================
   RESET SPEECH BUTTON
========================================================= */

function resetSpeechButton() {

    AppState.isSpeaking =
        false;

    if (DOM.speakBtn) {

        DOM.speakBtn.innerHTML = `

            <span class="speak-icon">
                🔊
            </span>

            <span>
                Listen
            </span>

        `;

    }

}

/* =========================================================
   SIDE MENU
========================================================= */

function openMenu() {

    DOM.sideMenu?.classList.add(

        "open"

    );


    DOM.menuOverlay?.classList.add(

        "open"

    );


    DOM.menuBtn?.setAttribute(

        "aria-expanded",

        "true"

    );

}


function closeMenu() {

    DOM.sideMenu?.classList.remove(

        "open"

    );


    DOM.menuOverlay?.classList.remove(

        "open"

    );


    DOM.menuBtn?.setAttribute(

        "aria-expanded",

        "false"

    );

}


/* =========================================================
   SIDE NAVIGATION
========================================================= */

function handleSideNavigation(
    event
) {

    const button =
        event.currentTarget;


    const view =
        button.dataset.view;


    document

        .querySelectorAll(

            ".side-nav-item"

        )

        .forEach(

            item => {

                item.classList.remove(

                    "active"

                );


                item.removeAttribute(

                    "aria-current"

                );

            }

        );


    button.classList.add(

        "active"

    );


    button.setAttribute(

        "aria-current",

        "page"

    );


    if (
        view === "favorites"
    ) {

        AppState.showFavoritesOnly =

            true;

    }


    if (
        view === "lessons"
    ) {

        AppState.showFavoritesOnly =

            false;

    }


    if (
        view === "progress"
    ) {

        showProgressInfo();

    }


    updateFavoritesButton();


    renderLessons();


    closeMenu();

}


/* =========================================================
   PROGRESS
========================================================= */

function showProgressInfo() {

    const total =
        getTotalLessons();


    const completed =

        AppState.completed.length;


    const percentage =

        total > 0

            ? Math.round(

                (

                    completed /

                    total

                ) * 100

            )

            : 0;


    showToast(

        `Completed: ${completed} / ${total} (${percentage}%)`

    );

}


function getTotalLessons() {

    return CONFIG.CHAPTERS.reduce(

        (total, chapter) => {

            const data =

                AppState.data[chapter];


            return (

                total +

                (

                    data?.lessons ||

                    []

                ).length

            );

        },

        0

    );

}


/* =========================================================
   CONTINUE LAST LESSON
========================================================= */

function continueLastLesson() {

    const lastLessonId =

        localStorage.getItem(

            CONFIG.STORAGE_KEYS.LAST_LESSON

        );


    if (
        !lastLessonId
    ) {

        showToast(

            "No previous lesson found."

        );


        closeMenu();


        return;

    }


    for (

        const chapter

        of CONFIG.CHAPTERS

    ) {

        const lessons =

            AppState.data[chapter]

                ?.lessons ||

            [];


        const index =

            lessons.findIndex(

                (lesson, lessonIndex) =>

                    getLessonId(

                        lesson,

                        lessonIndex

                    ) ===

                    String(

                        lastLessonId

                    )

            );


        if (
            index !== -1
        ) {

            AppState.currentChapter =

                chapter;


            AppState.currentLessonIndex =

                index;


            AppState.currentLesson =

                lessons[index];


            AppState.showFavoritesOnly =

                false;


            saveStorage();


            updateActiveChapter();


            renderLessons();


            renderReader();


            DOM.readerModal?.classList.remove(

                "hidden"

            );


            document.body.style.overflow =

                "hidden";


            closeMenu();


            return;

        }

    }


    showToast(

        "The previous lesson could not be found."

    );


    closeMenu();

}


/* =========================================================
   RESET PROGRESS
========================================================= */

function resetProgress() {

    openResetModal();

}


function openResetModal() {

    resetModal?.classList.remove(

        "hidden"

    );

}


function closeResetModal() {

    resetModal?.classList.add(

        "hidden"

    );

}


function confirmReset() {

    AppState.completed =

        [];


    localStorage.removeItem(

        CONFIG.STORAGE_KEYS.COMPLETED

    );


    saveStorage();


    renderLessons();


    closeResetModal();


    showToast(

        "Learning progress has been reset."

    );

}


/* =========================================================
   KEYBOARD
========================================================= */

function handleKeyboard(
    event
) {

    if (
        event.key ===
        "Escape"
    ) {

        if (

            DOM.readerModal &&

            !DOM.readerModal

                .classList

                .contains(

                    "hidden"

                )

        ) {

            closeReader();


            return;

        }


        if (

            resetModal &&

            !resetModal

                .classList

                .contains(

                    "hidden"

                )

        ) {

            closeResetModal();


            return;

        }


        closeMenu();

    }


    if (

        DOM.readerModal?.classList.contains(

            "hidden"

        )

    ) {

        return;

    }


    if (
        event.key ===
        "ArrowLeft"
    ) {

        previousLesson();

    }


    if (
        event.key ===
        "ArrowRight"
    ) {

        nextLesson();

    }

}


/* =========================================================
   LAST LESSON
========================================================= */

function saveLastLesson(
    lessonId,
    chapter
) {

    localStorage.setItem(

        CONFIG.STORAGE_KEYS.LAST_LESSON,

        String(lessonId)

    );


    localStorage.setItem(

        CONFIG.STORAGE_KEYS.CHAPTER,

        chapter

    );

}


/* =========================================================
   CHAPTER TITLES
========================================================= */

function getChapterTitle(
    chapter
) {

    const titles = {

        chapter1:
            "الفصل الأول",

        chapter2:
            "الفصل الثاني",

        chapter3:
            "الفصل الثالث"

    };


    return (

        titles[chapter] ||

        "English+"

    );

}


/* =========================================================
   CHAPTER DESCRIPTIONS
========================================================= */

function getChapterDescription(
    chapter
) {

    const descriptions = {

        chapter1:
            "Lessons of the first chapter",

        chapter2:
            "Lessons of the second chapter",

        chapter3:
            "Lessons of the third chapter"

    };


    return (

        descriptions[chapter] ||

        "Learn English"

    );

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer =
    null;


function showToast(
    message
) {

    if (

        !DOM.toast ||

        !DOM.toastMessage

    ) {

        return;

    }


    DOM.toastMessage.textContent =

        message;


    DOM.toast.classList.add(

        "show"

    );


    clearTimeout(

        toastTimer

    );


    toastTimer =

        setTimeout(

            () => {

                DOM.toast.classList.remove(

                    "show"

                );

            },

            2500

        );

}


/* =========================================================
   DATA ERROR
========================================================= */

function showDataError() {

    if (!DOM.lessonsList) {

        return;

    }


    DOM.lessonsList.innerHTML =

        `

            <div class="empty-state">

                <div class="empty-icon">

                    ⚠️

                </div>


                <h3>

                    Unable to load lessons

                </h3>


                <p>

                    Please make sure that

                    <strong>

                        chapter1.json,
                        chapter2.json,
                        chapter3.json

                    </strong>

                    are available in the

                    <strong>

                        data

                    </strong>

                    folder.

                </p>

            </div>

        `;

}


/* =========================================================
   THEME
========================================================= */

const savedTheme =

    localStorage.getItem(

        "englishPlusTheme"

    );


if (savedTheme) {

    document.documentElement.dataset.theme =

        savedTheme;

} else {

    document.documentElement.dataset.theme =

        "light";

}


function toggleTheme() {

    const currentTheme =

        document.documentElement.dataset.theme;


    const newTheme =

        currentTheme === "dark"

            ? "light"

            : "dark";


    document.documentElement.dataset.theme =

        newTheme;


    localStorage.setItem(

        "englishPlusTheme",

        newTheme

    );


    updateThemeButton();

}


function updateThemeButton() {

    if (!themeToggleBtn) {

        return;

    }


    const theme =

        document.documentElement.dataset.theme;


    const icon =

        themeToggleBtn.querySelector(

            "span:first-child"

        );


    const text =

        themeToggleBtn.querySelector(

            "span:last-child"

        );


    if (icon) {

        icon.textContent =

            theme === "dark"

                ? "☀️"

                : "🌙";

    }


    if (text) {

        text.textContent =

            theme === "dark"

                ? "Light Mode"

                : "Dark Mode";

    }

}


/* =========================================================
   SECURITY HELPERS
========================================================= */

function escapeHTML(
    value
) {

    return String(value)

        .replace(

            /&/g,

            "&amp;"

        )

        .replace(

            /</g,

            "&lt;"

        )

        .replace(

            />/g,

            "&gt;"

        )

        .replace(

            /"/g,

            "&quot;"

        )

        .replace(

            /'/g,

            "&#039;"

        );

}


function escapeAttribute(
    value
) {

    return escapeHTML(

        value

    );

}


/* =========================================================
   END
========================================================= */

console.log(

    "English+ 4MS application loaded successfully."

);