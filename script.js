(function () {
  var $ = function (i) {
    return document.getElementById(i);
  };
  var TOTAL = 6,
    patience,
    round,
    history,
    used,
    facts,
    items,
    ban,
    busy = false;

  function setMood(m) {
    var st = $("stage");
    st.classList.remove("suspicious", "mad", "wow", "happy");
    if (m !== "calm") st.classList.add(m);
  }
  function show(p) {
    p = Math.max(0, Math.min(100, Math.round(p)));
    $("pct").textContent = p + "%";
    $("fill").style.width = p + "%";
    $("fill").classList.toggle("low", p < 45);
    setMood(p >= 65 ? "calm" : p >= 35 ? "suspicious" : "mad");
  }
  function view(n) {
    ["intro", "play", "end"].forEach(function (x) {
      $(x).hidden = x !== n;
    });
  }
  function showErr(t) {
    var e = $("err");
    e.textContent = t || "";
    e.hidden = !t;
  }
  
  function chips(list) {
    var c = $("chips");
    c.textContent = "";
    list.forEach(function (x) {
      var s = document.createElement("span");
      s.className = "chip " + (x[1] ? "good" : "bad");
      s.textContent = x[0];
      c.appendChild(s);
    });
  }
  function rnd(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
  }
  function pick(arr) {
    var f = arr.filter(function (r) {
        return !used[r];
      }),
      l = f.length ? f : arr,
      r = l[rnd(0, l.length - 1)];
    used[r] = 1;
    return r;
  }

  var ROUNDS = [
    { q: "Well? Where's the homework?", h: "Anything goes. Make it good." },
    {
      q: "Go on. What actually happened?",
      h: "Bonus: tell it as a story, step by step.",
      l: "Told a story",
      b: 10,
      re: function (t) {
        return /\b(then|suddenly|so i|after|while|when)\b/.test(t);
      },
    },
    {
      q: "And who can confirm that?",
      h: "Bonus: name a witness.",
      l: "Witness",
      b: 12,
      re: function (t) {
        return /\b(friend|mom|dad|neighbou?r|everyone|nurse|coach|sister|brother|grandma|grandpa|classmates?|bus driver|janitor|whole class|witness)\b/.test(
          t,
        );
      },
    },
    {
      q: "When exactly did this happen?",
      h: "Bonus: give an exact time.",
      l: "Exact time",
      b: 12,
      re: function (t) {
        return /(\d|yesterday|last night|this morning|monday|tuesday|wednesday|thursday|friday|weekend|midnight|noon)/.test(
          t,
        );
      },
    },
    {
      q: "Why am I only hearing this now?",
      h: "Bonus: give a reason you stayed quiet.",
      l: "Honest reason",
      b: 12,
      re: function (t) {
        return /\b(because|since|scared|afraid|embarrass\w*|didn.t want|thought)\b/.test(
          t,
        );
      },
    },
    {
      q: "Last chance. Convince me.",
      h: "Bonus: go big. Ten words or more.",
      l: "All in",
      b: 15,
      re: function (t, w) {
        return w >= 10;
      },
    },
  ];
  var BANS = [
    { id: "pets", name: "pets" },
    { id: "tech", name: "technology" },
    { id: "sick", name: "sickness" },
    { id: "family", name: "family" },
    { id: "lazy", name: "being tired" },
  ];

  function C(id, re, lo, hi, r) {
    return { id: id, re: re, lo: lo, hi: hi, r: r };
  }
  var CATS = [
    C(
      "pets",
      /\b(?:dog|cat|puppy|kitten|hamster|pet|fish|bird|parrot|ate it|eaten)s?\b/,
      2,
      15,
      [
        "You don't have a dog. I've seen your emergency contact form.",
        "Your dog has eaten your homework four times. Impressive digestion, honestly.",
        "A pet. Of course. Does it also file your taxes?",
        "Bring the animal in. I have questions. Also treats.",
        "That excuse is older than this school. Bring a new one.",
        "If a hamster ate it, I'd like the hamster to submit it itself.",
      ],
    ),
    C(
      "tech",
      /\b(?:wifi|internet|computer|laptop|printer|crash\w*|email|cloud|battery|phone|update|file|deleted|server|bug)s?\b/,
      20,
      35,
      [
        "Technology fails you once. It has failed you every week since September.",
        "The cloud is just someone else's computer, and you didn't do it there either.",
        "Have you tried turning your effort off and on again?",
        "Show me the error message. Not a screenshot of your desktop.",
        "Ah, the sacred “it saved but also didn't” defense.",
      ],
    ),
    C(
      "sick",
      /\b(?:sick|ill|flu|fever|cough\w*|sneez\w*|hospital|doctor|headache|nausea|barf|vomit)\b/,
      25,
      40,
      [
        "You were at the school fair yesterday. You won a goldfish.",
        "Sick, but strong enough to type this excuse? Interesting immune system.",
        "Get well soon. The worksheet will wait. It is very patient. I am not.",
        "Sick people usually don't have this much energy to argue.",
      ],
    ),
    C(
      "family",
      /\b(?:mom|dad|mother|father|brother|sister|grandma|grandpa|aunt|uncle|cousin|parents?|baby|family)\b/,
      25,
      40,
      [
        "Family emergencies are real. This one feels like a Tuesday.",
        "Your grandmother has now died, recovered, and moved to Spain in my gradebook.",
        "I'll give your mom a call. She loves me. I have her number.",
        "Family is important. So is page twelve.",
        "Which relative this time? I'm updating my chart.",
      ],
    ),
    C(
      "weather",
      /\b(?:rain\w*|storm\w*|flood\w*|snow\w*|wind|tornado|power|electric\w*|blackout|fire|earthquake|lightning)\b/,
      30,
      45,
      [
        "It's sunny out. I'm looking out the window right now.",
        "A storm that only hit your homework. Scientists would like a word.",
        "Blackout? People did homework by candlelight for centuries. Show some grit.",
        "Acts of nature are valid. Acts of procrastination are not.",
      ],
    ),
    C(
      "sports",
      /\b(?:practice|rehearsal|tournament|match|club|band|team|coach|recital|training)\b/,
      28,
      45,
      [
        "I respect the commitment. Now commit to a worksheet.",
        "Teamwork is great. Your team can't write your essay.",
        "Coach emailed me. You owe fifteen minutes of homework, not fifteen hours.",
        "Great, you're busy. So is everyone I've ever taught.",
      ],
    ),
    C(
      "chores",
      /\b(?:chores?|job|work|shift|babysit\w*|boss|dishes|laundry)\b/,
      28,
      42,
      [
        "A job shift is real. Fair enough. You still owe me paragraphs.",
        "Respect the hustle. The hustle must include page twelve.",
        "Chores? In this economy? Fair. Still, I need a page.",
      ],
    ),
    C(
      "travel",
      /\b(?:trip|vacation|flight|airport|passport|moved|moving|holiday|road ?trip)\b/,
      30,
      48,
      [
        "A trip? And you forgot to bring back a postcard or homework.",
        "Airports have Wi-Fi. I checked.",
        "You moved? Interesting. I mailed your seating chart to the same room.",
      ],
    ),
    C(
      "stress",
      /\b(?:stress\w*|overwhelm\w*|anxious|anxiety|burn\w* ?out|panic\w*|pressure)\b/,
      28,
      45,
      [
        "That's fair, truly. Let's start smaller: one paragraph. Which part?",
        "Stress is real. So is a due date. Talk to me, not the void.",
        "Feeling overwhelmed is okay. Hiding it behind a story is not.",
      ],
    ),
    C(
      "copy",
      /\b(?:copied|copy|cheat\w*|borrow\w*|plagiar\w*|someone else)\b/,
      0,
      8,
      [
        "Never say “copied” to a teacher. It's the one word we all have antennae for.",
        "Your friend did it? Then your friend gets the grade. Awkward.",
        "Cheating and failing to hide it. Efficient.",
      ],
    ),
    C(
      "magic",
      /\b(?:alien\w*|ufo|abduct\w*|ghost\w*|haunt\w*|wizard\w*|dragon\w*|dinosaur\w*|vampire\w*|zombie\w*|time travel\w*|time loop|portal|robot\w*|bigfoot|magic\w*|curse\w*|cursed)\b/,
      38,
      58,
      [
        "I admire the ambition. Still no homework.",
        "Aliens, again? Tell them they can keep it if I get a grade first.",
        "If that's true, you're the most interesting student in this building. Also still failing.",
        "A cursed pencil. I'll write that in the report, next to “made it up.”",
        "Dragons are not in the curriculum. Neither is that excuse.",
        "A time loop? So you had infinite time and still no homework?",
      ],
    ),
    C(
      "meta",
      /(due next|thought it was|wrong day|wasn.t assigned|didn.t know|never said|nobody told|you never)/,
      12,
      28,
      [
        "It was on the board. It's always on the board. I wrote it in red.",
        "I said it three times and posted it in the group chat. You reacted with a thumbs-up.",
        "The syllabus is a document, not a suggestion.",
        "I emailed it. I texted it. I emailed it again.",
      ],
    ),
    C(
      "lost",
      /\b(?:lost|misplaced|left it|bag|backpack|locker|bus|car|stolen|stole|robbed|vanished)\b/,
      25,
      40,
      [
        "It's a piece of paper, not your dignity. You'll lose both eventually.",
        "Check your backpack. Then the other backpack. Then your attitude.",
        "Things that vanish: your homework, your pen, your credibility.",
      ],
    ),
    C(
      "food",
      /\b(?:spill\w*|juice|coffee|soup|milk|pasta|cereal|taco\w*|burger\w*|sandwich\w*|lunch|soda)\b/,
      30,
      50,
      [
        "A spill. The universal excuse of the unprepared. Soggy pages still count.",
        "Bring me the stained page. And a snack. I've been hungry since second period.",
        "Soup ruined it? Bring the soup. For evidence.",
      ],
    ),
    C(
      "lazy",
      /\b(?:sleep\w*|slept|tired|forgot|forget|lazy|nap|bored|netflix|games?|gaming|youtube|tiktok)\b/,
      3,
      18,
      [
        "At least it's honest. Still a no.",
        "Tired? I've been tired since 2009. I still grade papers.",
        "Forgot. The most truthful excuse and the least effective one.",
        "Thank you for your honesty. Please enjoy your detention.",
        "Everyone's busy. Some of us still finish things.",
      ],
    ),
  ];
  var SECRETS = [
    {
      re: /hack ?club/,
      r: "Hack Club? You were building something instead? Extension granted. Show me the demo.",
      s: 95,
    },
    {
      re: /\bpizza\b/,
      r: "A pizza ate your homework? Finally, an excuse I can respect. Which toppings?",
      s: 80,
    },
    {
      re: /\bclaude\b|\bchatgpt\b|\bai\b/,
      r: "You asked a robot to do your homework and then blamed the robot? Bold.",
      s: 60,
    },
    {
      re: /\bpruitt\b/,
      r: "Yes, that's my name. Flattery gets you a pencil, not an extension.",
      s: 55,
    },
  ];
  var IMPRESSED = [
    "Okay. That was… actually convincing. I hate that.",
    "I'm writing that one down. For my memoir.",
    "You put thought into that. Where was this energy on Monday?",
    "Fine. Fine! That's the best one this semester.",
    "Hm. I would believe that. Don't make me regret it.",
  ];
  var REPEAT = [
    "Didn't we already do this topic? Be creative.",
    "You're recycling excuses. I recycle too, but responsibly.",
    "Same subject twice. I'm starting to see a pattern.",
    "Another one from the same family of lies. Variety, please.",
  ];
  var CALLBACK = [
    function (p) {
      return "First “" + p + "”, now this. Pick a lane.";
    },
    function (p) {
      return "Hold on. A minute ago it was “" + p + "”.";
    },
    function (p) {
      return "So “" + p + "” is out the window? Okay.";
    },
  ];
  var GREET = [
    "I'm your teacher, not your friend. Excuse. Now.",
    "Hello. That is not an excuse. Try again.",
  ];
  var SHORT = [
    "Focus. That's a word, not an excuse.",
    "I need a story, not a sticky note.",
    "Is that all? I've heard longer sneezes.",
  ];
  var GIBBER = [
    "Did you lean on your keyboard?",
    "I've seen cats type better excuses.",
  ];
  var LONG = [
    "Fine. I respect the effort. I don't believe it, but I respect it.",
    "That was a lot of words. Some were even convincing. Not all.",
  ];
  var DEFAULT = [
    "I don't know what that was, but I'm too tired to argue.",
    "Hm. Specific. I hate that I almost believe it.",
    "Interesting. Wrong, but interesting.",
  ];
  var WAIT = [
    "Mrs. Pruitt is staring at you…",
    "Mrs. Pruitt is polishing her glasses…",
    "Mrs. Pruitt is sighing…",
  ];

  function judge(text) {
    var t = text.toLowerCase().trim(),
      wc = t.split(/\s+/).filter(Boolean).length,
      prev = history[history.length - 1],
      ch = [],
      cat = null,
      score,
      reply,
      locked = false,
      i;
    if (
      history.some(function (h) {
        return h.excuse.toLowerCase() === t;
      })
    )
      return {
        reply: "You said that already. Out loud. I was there.",
        score: 0,
        cat: "dupe",
        chips: [["Same excuse again", 0]],
      };
    for (i = 0; i < SECRETS.length; i++)
      if (SECRETS[i].re.test(t))
        return {
          reply: SECRETS[i].r,
          score: SECRETS[i].s,
          cat: "secret",
          chips: [["Secret word!", 1]],
        };
    for (i = 0; i < CATS.length; i++)
      if (CATS[i].re.test(t)) {
        cat = CATS[i];
        break;
      }
    if (cat && cat.id === ban.id)
      return {
        reply:
          "I said no " + ban.name + " today. I wrote it on the board. In red.",
        score: 0,
        cat: "ban",
        chips: [["Banned topic", 0]],
      };

    if (cat) {
      score = rnd(cat.lo, cat.hi);
      reply = pick(cat.r);
    } else if (/^(hi|hello|hey|yo|sup|hola)\b/.test(t)) {
      cat = { id: "greet" };
      score = 6;
      reply = pick(GREET);
    } else if ((wc === 1 && !/[aeiou]/.test(t)) || /(.)\1{4,}/.test(t)) {
      cat = { id: "gibber" };
      score = 3;
      reply = pick(GIBBER);
    } else if (wc < 3) {
      cat = { id: "short" };
      score = 8;
      reply = pick(SHORT);
    } else if (wc >= 12) {
      cat = { id: "long" };
      score = rnd(50, 62);
      reply = pick(LONG);
    } else {
      cat = { id: "other" };
      score = rnd(30, 45);
      reply = pick(DEFAULT);
    }

    var real = cat.lo !== undefined;
    function m(n, l) {
      score += n;
      ch.push([l + " " + (n > 0 ? "+" : "-") + Math.abs(n), n > 0]);
    }

    if (
      real &&
      history.some(function (h) {
        return h.cat === cat.id;
      })
    ) {
      m(-15, "Repeated topic");
      reply = pick(REPEAT);
      locked = true;
    }
    if (
      facts.sick &&
      /\b(party|fair|mall|movie|beach|game|gaming|concert|pool|park|vacation)\b/.test(
        t,
      )
    ) {
      m(-20, "Contradiction");
      reply = "You were sick. Now you're out having fun? Pick one.";
      locked = true;
    } else if (
      facts.power &&
      (cat.id === "tech" ||
        /\b(netflix|youtube|wifi|laptop|computer)\b/.test(t))
    ) {
      m(-20, "Contradiction");
      reply = "No power, but your laptop crashed? Run that by me again.";
      locked = true;
    }

    if (facts.note && cat.id === "sick") {
      m(-20, "Note already used");
      reply =
        "You gave me a doctor's note. Now you're sick again? Same illness?";
      locked = true;
    }
    var rb = ROUNDS[round - 1];
    if (rb.re && rb.re(t, wc)) m(rb.b, rb.l);

    if (wc >= 12) m(8, "Detailed");
    else if (wc >= 7) m(4, "Detailed");
    if (/\b(please|sorry)\b/.test(t)) m(5, "Polite");
    if (cat.id === "magic") ch.unshift(["Creative", 1]);
    if (prev && prev.score >= 55 && score >= 55) m(8, "Combo");
    if (!locked && real && prev && Math.random() < 0.35)
      reply =
        CALLBACK[rnd(0, 2)](
          prev.excuse.length > 38
            ? prev.excuse.slice(0, 35) + "…"
            : prev.excuse,
        ) +
        " " +
        reply;
    if (cat.id === "sick") facts.sick = 1;
    if (cat.id === "weather" && /power|blackout|electric/.test(t))
      facts.power = 1;
    score = Math.max(0, Math.min(100, score));

    if (score >= 70 && !locked) reply = pick(IMPRESSED);

    return { reply: reply, score: score, cat: cat.id, chips: ch };
  }

  function nextUi() {
    $("round").textContent = "Round " + round + " of " + TOTAL;
    $("hint").textContent = ROUNDS[round - 1].h;
  }
  function lock(on) {
    busy = on;
    $("say").disabled = on;
    $("excuse").disabled = on;
  }

  function submit() {
    if (busy) return;
    var text = $("excuse").value.trim();
    if (!text) {
      showErr("Say something. Silence is also not homework.");
      return;
    }
    showErr("");
    lock(true);
    $("a").textContent = text;
    $("q").textContent = pick(WAIT);
    $("nq").textContent = "";
    $("chips").textContent = "";
    var res = judge(text);
    setTimeout(function () {
      lock(false);
      history.push({ excuse: text, cat: res.cat, score: res.score });
      var d = (res.score - 50) * 0.9;
      if (d < 0 && round >= 4) d *= 1.2;
      d = Math.round(d);
      patience = Math.min(100, patience + d);
      var c = res.chips.slice();
      c.push(["Patience " + (d >= 0 ? "+" : "-") + Math.abs(d), d >= 0]);
      chips(c);
      $("q").textContent = res.reply;
      show(patience);
      if (res.score >= 70) setMood("wow");
      $("excuse").value = "";
      if (patience <= 0) {
        finish(false);
        return;
      }
      if (round >= TOTAL) {
        finish(true);
        return;
      }
      round++;
      nextUi();
      $("nq").textContent = ROUNDS[round - 1].q;
      $("excuse").focus();
    }, 800);
  }

  function useItem(kind) {
    if (busy || !items[kind]) return;
    items[kind] = 0;
    $(kind === "eyes" ? "eyes" : "note").disabled = true;
    var d, line, mood;
    if (kind === "eyes") {
      var ok = Math.random() < 0.5;
      d = ok ? 30 : -15;
      $("a").textContent = "*puppy eyes*";
      line = ok
        ? "…Fine. Those eyes. Stop it. Take a breath."
        : "I'm immune. I own a cat, and she's better at it.";
      mood = ok ? "wow" : "mad";
    } else {
      d = 25;
      facts.note = 1;
      $("a").textContent = "*hands over a note*";
      line = "A doctor's note signed “Dr. Mom.” Cute. I'll allow it. Once.";
      mood = "suspicious";
    }
    patience = Math.min(100, patience + d);
    $("q").textContent = line;
    chips([["Patience " + (d >= 0 ? "+" : "-") + Math.abs(d), d >= 0]]);
    show(patience);
    setMood(mood);
    if (patience <= 0) finish(false);
  }

  function finish(won) {
    lock(true);
    setMood(won ? "happy" : "mad");
    setTimeout(function () {
      view("end");
      var avg =
        history.reduce(function (s, h) {
          return s + h.score;
        }, 0) / history.length;
      var g = !won
        ? ["F", "Detention Regular"]
        : avg >= 60
          ? ["S", "Legendary Liar"]
          : avg >= 48
            ? ["A", "Smooth Operator"]
            : avg >= 36
              ? ["B", "Decent Fibber"]
              : ["C", "Barely Survived"];
      var best = history.reduce(function (b, h) {
        return h.score > b.score ? h : b;
      }, history[0]);
      var p = Math.max(0, Math.round(patience));
      var W = [
        "Mrs. Pruitt sighs, writes “extension” on a sticky note, and walks away. " +
          p +
          "% patience left.",
        "She closes the gradebook, takes off her glasses, and mutters “see you tomorrow.” " +
          p +
          "% patience left.",
        "She is too tired to argue. You're free. For now. " +
          p +
          "% patience left.",
      ];
      var L = [
        "Her patience hit zero. She hands you a pencil and a very long worksheet.",
        "She slowly takes off her glasses. That's never good. Detention, 3:15, Room 204.",
        "She doesn't even yell. She just writes your name on the board. In red.",
      ];
      $("grade").textContent = "Grade " + g[0] + " · " + g[1];
      $("endTitle").textContent = won ? "She gave up." : "Detention.";
      $("endText").textContent =
        (won ? W : L)[rnd(0, 2)] +
        " Best excuse: “" +
        best.excuse +
        "” (" +
        best.score +
        ").";
      var r = $("receipt");
      r.textContent = "";
      history.forEach(function (h, i) {
        var row = document.createElement("div"),
          a = document.createElement("span"),
          b = document.createElement("b");
        a.textContent = i + 1 + ". “" + h.excuse + "”";
        b.textContent = h.score;
        row.appendChild(a);
        row.appendChild(b);
        r.appendChild(row);
      });
    }, 1700);
  }

  function reset() {
    patience = 100;
    round = 1;
    history = [];
    used = {};
    facts = {};
    items = { eyes: 1, note: 1 };
    ban = BANS[rnd(0, BANS.length - 1)];
    $("ban").textContent = "Banned today: " + ban.name;
    $("eyes").disabled = false;
    $("note").disabled = false;
    lock(false);
    showErr("");
    $("q").textContent = ROUNDS[0].q;
    $("nq").textContent = "";
    $("a").textContent = "…";
    $("chips").textContent = "";
    nextUi();
    show(100);
    setMood("calm");
    view("play");
    $("excuse").value = "";
    $("excuse").focus();
  }

  $("start").addEventListener("click", reset);
  $("again").addEventListener("click", reset);
  $("say").addEventListener("click", submit);
  $("eyes").addEventListener("click", function () {
    useItem("eyes");
  });
  $("note").addEventListener("click", function () {
    useItem("note");
  });
  $("excuse").addEventListener("keydown", function (e) {
    if (e.key === "Enter") submit();
  });
  show(100);
  setMood("calm");
})();