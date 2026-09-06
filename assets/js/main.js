/* ============================================================
   main.js — 4つだけ。増やさない。
     1. ふわっと出す（fade-up）
     2. ナビの現在地
     3. 全実績の絞り込み
     4. カードレールの矢印 ＋ 試聴の埋め込み差し込み
   ライブラリは使わない。JS を切っても中身は全部読める。
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. fade-up ------------------------------------------------ */
  var targets = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = Math.min(i, 4) * 80 + "ms";
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* 2. ナビの現在地 ------------------------------------------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".site-nav a"));
  if ("IntersectionObserver" in window && links.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute("aria-current"); });
        var hit = links.filter(function (a) { return a.getAttribute("href") === "#" + e.target.id; })[0];
        if (hit) hit.setAttribute("aria-current", "page");
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    Array.prototype.forEach.call(document.querySelectorAll("main [id]"), function (s) { spy.observe(s); });
  }

  /* 3. 絞り込み ----------------------------------------------- */
  var group = document.querySelector("[data-filter-group]");
  var target = document.querySelector("[data-filter-target]");
  if (group && target) {
    var rows = Array.prototype.slice.call(target.querySelectorAll("[data-category]"));
    var buttons = Array.prototype.slice.call(group.querySelectorAll("[data-filter]"));
    var apply = function (key) {
      rows.forEach(function (r) {
        if (r.getAttribute("data-category") === key) r.removeAttribute("hidden");
        else r.setAttribute("hidden", "");
      });
      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-filter") === key ? "true" : "false");
      });
    };
    buttons.forEach(function (b) {
      b.addEventListener("click", function () { apply(b.getAttribute("data-filter")); });
    });
    var first = buttons.filter(function (b) { return b.getAttribute("aria-pressed") === "true"; })[0];
    if (first) apply(first.getAttribute("data-filter"));   /* JS があるときだけ絞り込む */
  }

  /* 4a. レールの矢印 ------------------------------------------ */
  Array.prototype.forEach.call(document.querySelectorAll("[data-rail-ctrl]"), function (ctrl) {
    var rail = ctrl.closest("section").querySelector(".rail");
    if (!rail) return;
    ctrl.removeAttribute("hidden");                        /* JS があるときだけ出す */
    var btns = ctrl.querySelectorAll("button");
    var step = function () { return rail.clientWidth * 0.6; };
    btns[0].addEventListener("click", function () { rail.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }); });
    btns[1].addEventListener("click", function () { rail.scrollBy({ left:  step(), behavior: reduce ? "auto" : "smooth" }); });
  });

  /* 4b. 試聴の埋め込みは押されてから差し込む（初期表示を軽くする） */
  Array.prototype.forEach.call(document.querySelectorAll("[data-embed]"), function (box) {
    var link = box.matches("a") ? box : box.querySelector("a");
    if (!link) return;
    link.addEventListener("click", function (ev) {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button === 1) return;  /* 新しいタブで開きたい人はそのまま */
      ev.preventDefault();
      var f = document.createElement("iframe");
      f.src = box.getAttribute("data-embed");
      f.title = box.getAttribute("aria-label") || "Spotify プレイヤー";
      f.loading = "lazy";
      f.allow = "encrypted-media; clipboard-write; fullscreen; picture-in-picture";
      box.innerHTML = "";
      box.classList.add("is-playing");
      box.removeAttribute("style");
      box.appendChild(f);
    });
  });
})();
