( function() {
    var $=function(i){
        return document.getElementById(i)
    };
    var TOTAL=6, patience,round,history,used,facts,items,ban,busy=false;
    var words=["“My dog ate it”","“It's in the cloud”","“I thought it was due next week”","“My printer is haunted”","“I got sleepy”"]
    words.concat(words).forEach(function(w){
        vars=document.createElement("span");
        textContent=w;
        $("track").appendChild(s)
    });

    var MOUTH={
            calm:"M66 130 q14 6 28 0",
            suspicious:"M66 130 h28",
            mad:"M64 134 q16 -12 32 0",
            wow:"M72 130 a8 7 0 1 0 16 0 a8 7 0 1 0 -16 0",
            happy:"M62 128 q18 18 36 0"};
    function setMood(m){
        var st=$("stage"); st.classList.remove("suspicious","mad","wow","happy");
        if(m!="calm")st.classList.add(m);
        $("mouth").setAttribute("d",MOUTH[m]);
        
    }
    function show(p){
        p=Math.max(0,Math.min(100,Math.round(p)));

    $("pct").textContent=p+"%";
    $("fill").style.width=p+"%";
    $("fill").classList.toggle("low", p<45);
        setMood(p>=65? "calm": p>=35? "suspicious":"mad");
    }
    function view(n){["intro","play", "end"].forEach(function(x){$(x).hidden=(x!==n)})}
    function showErr(t){var e=$("err");e.textContent=t || "";e.hidden=!t}
    function chips(list){
        var c=$("chips");
        c.textContent="";
         list.forEach(function(x){var s=document.createElement("span");s.className="chip "+(x[1]?"good":"bad");s.textContent=x[0];c.appendChild(s)});
    }
    function rnd(a,b) {
        return a+Math.floor(Math.random()*(b-a+1))    }
    function pick(arr) {
          var f=arr.filter(function(r){return !used[r]}),l=f.length?f:arr,r=l[rnd(0,l.length-1)];used[r]=1;return r;
    }

    var ROUNDS=[
        {q:"Well? Where's the homework?",h:"Anything goes. Make it good."},
        {q:"Go on. What actually happened?",h:"Bonus: tell it as a story, step by step.",l:"Told a story",b:10,re:function(t){return /\b(then|suddenly|so i|after|while|when)\b/.test(t)}},
        {q:"And who can confirm that?",h:"Bonus: name a witness.",l:"Witness",b:12,re:function(t){return /\b(friend|mom|dad|neighbou?r|everyone|nurse|coach|sister|brother|grandma|grandpa|classmates?|bus driver|janitor|whole class|witness)\b/.test(t)}},
        {q:"When exactly did this happen?",h:"Bonus: give an exact time.",l:"Exact time",b:12,re:function(t){return /(\d|yesterday|last night|this morning|monday|tuesday|wednesday|thursday|friday|weekend|midnight|noon)/.test(t)}},
        {q:"Why am I only hearing this now?",h:"Bonus: give a reason you stayed quiet.",l:"Honest reason",b:12,re:function(t){return /\b(because|since|scared|afraid|embarrass\w*|didn.t want|thought)\b/.test(t)}},
        {q:"Last chance. Convince me.",h:"Bonus: go big. Ten words or more.",l:"All in",b:15,re:function(t,w){return w>=10}}
    ];
    var BANS=[{id:"pets",name:"pets"},{id:"tech",name:"technology"},{id:"sick",name:"sickness"},{id:"family",name:"family"},{id:"lazy",name:"being tired"}];

    function C(id,re,lo,hi,r){return {id:id,re:re,lo:lo,hi:hi,r:r}}
    var CATS=[
        C("pets",/\b(?:dog|cat|puppy|kitten|hamster|pet|fish|bird|parrot|ate it|eaten)s?\b/,2,15,[
        "You don't have a dog. I've seen your emergency contact form.","Your dog has eaten your homework four times. Impressive digestion, honestly.","A pet. Of course. Does it also file your taxes?","Bring the animal in. I have questions. Also treats.","That excuse is older than this school. Bring a new one.","If a hamster ate it, I'd like the hamster to submit it himself."]),
        C("tech",/\b(?:wifi|internet|computer|laptop|printer|crash\w*|email|cloud|battery|phone|update|file|deleted|server|bug)s?\b/,20,35,[
        "Technology fails you once. It has failed you every week since September.","The cloud is just someone else's computer, and you didn't do it there either.","Have you tried turning your effort off and on again?","Show me the error message. Not a screenshot of your desktop.","Ah, the sacred “it saved but also didn't” defense."]),
        C("sick",/\b(?:sick|ill|flu|fever|cough\w*|sneez\w*|hospital|doctor|headache|nausea|barf|vomit)\b/,25,40,[
        "You were at the school fair yesterday. You won a goldfish.","Sick, but strong enough to type this excuse? Interesting immune system.","Get well soon. The worksheet will wait. It is very patient. I am not.","Sick people usually don't have this much energy to argue."]),
        C("family",/\b(?:mom|dad|mother|father|brother|sister|grandma|grandpa|aunt|uncle|cousin|parents?|baby|family)\b/,25,40,[
        "Family emergencies are real. This one feels like a Tuesday.","Your grandmother has now died, recovered, and moved to Spain in my gradebook.","I'll give your mom a call. She loves me. I have her number.","Family is important. So is page twelve.","Which relative this time? I'm updating my chart."]),
        C("weather",/\b(?:rain\w*|storm\w*|flood\w*|snow\w*|wind|tornado|power|electric\w*|blackout|fire|earthquake|lightning)\b/,30,45,[
        "It's sunny out. I'm looking out the window right now.","A storm that only hit your homework. Scientists would like a word.","Blackout? People did homework by candlelight for centuries. Show some grit.","Acts of nature are valid. Acts of procrastination are not."]),
        C("sports",/\b(?:practice|rehearsal|tournament|match|club|band|team|coach|recital|training)\b/,28,45,[
        "I respect the commitment. Now commit to a worksheet.","Teamwork is great. Your team can't write your essay.","Coach emailed me. You owe fifteen minutes of homework, not fifteen hours.","Great, you're busy. So is everyone I'  ve ever taught."]),
        C("chores",/\b(?:chores?|job|work|shift|babysit\w*|boss|dishes|laundry)\b/,28,42,[
        "A job shift is real. Fair enough. You still owe me paragraphs.","Respect the hustle. The hustle must include page twelve.","Chores? In this economy? Fair. Still, I need a page."]),
        C("travel",/\b(?:trip|vacation|flight|airport|passport|moved|moving|holiday|road ?trip)\b/,30,48,[
        "A trip? And you forgot to bring back a postcard or homework.","Airports have Wi-Fi. I checked.","You moved? Interesting. I mailed your seating chart to the same room."]),
        C("stress",/\b(?:stress\w*|overwhelm\w*|anxious|anxiety|burn\w* ?out|panic\w*|pressure)\b/,28,45,[
        "That's fair, truly. Let's start smaller: one paragraph. Which part?","Stress is real. So is a due date. Talk to me, not the void.","Feeling overwhelmed is okay. Hiding it behind a story is not."]),
        C("copy",/\b(?:copied|copy|cheat\w*|borrow\w*|plagiar\w*|someone else)\b/,0,8,[
        "Never say “copied” to a teacher. It's the one word we all have antennae for.","Your friend did it? Then your friend gets the grade. Awkward.","Cheating and failing to hide it. Efficient."]),
        C("magic",/\b(?:alien\w*|ufo|abduct\w*|ghost\w*|haunt\w*|wizard\w*|dragon\w*|dinosaur\w*|vampire\w*|zombie\w*|time travel\w*|time loop|portal|robot\w*|bigfoot|magic\w*|curse\w*|cursed)\b/,38,58,[
        "I admire the ambition. Still no homework.","Aliens, again? Tell them they can keep it if I get a grade first.","If that's true, you're the most interesting student in this building. Also still failing.","A cursed pencil. I'll write that in the report, next to “made it up.”","Dragons are not in the curriculum. Neither is that excuse.","A time loop? So you had infinite time and still no homework?"]),
        C("meta",/(due next|thought it was|wrong day|wasn.t assigned|didn.t know|never said|nobody told|you never)/,12,28,[
        "It was on the board. It's always on the board. I wrote it in red.","I said it three times and posted it in the group chat. You reacted with a thumbs-up.","The syllabus is a document, not a suggestion.","I emailed it. I texted it. I emailed it again."]),
        C("lost",/\b(?:lost|misplaced|left it|bag|backpack|locker|bus|car|stolen|stole|robbed|vanished)\b/,25,40,[
        "It's a piece of paper, not your dignity. You'll lose both eventually.","Check your backpack. Then the other backpack. Then your attitude.","Things that vanish: your homework, your pen, your credibility."]),
        C("food",/\b(?:spill\w*|juice|coffee|soup|milk|pasta|cereal|taco\w*|burger\w*|sandwich\w*|lunch|soda)\b/,30,50,[
        "A spill. The universal excuse of the unprepared. Soggy pages still count.","Bring me the stained page. And a snack. I've been hungry since second period.","Soup ruined it? Bring the soup. For evidence."]),
        C("lazy",/\b(?:sleep\w*|slept|tired|forgot|forget|lazy|nap|bored|netflix|games?|gaming|youtube|tiktok)\b/,3,18,[
        "At least it's honest. Still a no.","Tired? I've been tired since 2009. I still grade papers.","Forgot. The most truthful excuse and the least effective one.","Thank you for your honesty. Please enjoy your detention.","Everyone's busy. Some of us still finish things."])
    ];
    var SECRETS=[
        {re:/hack ?club/,r:"Hack Club? You were building something instead? Extension granted. Show me the demo.",s:95},
        {re:/\bpizza\b/,r:"A pizza ate your homework? Finally, an excuse I can respect. Which toppings?",s:80},
        {re:/\bclaude\b|\bchatgpt\b|\bai\b/,r:"You asked a robot to do your homework and then blamed the robot? Bold.",s:60},
        {re:/\bpruitt\b/,r:"Yes, that's my name. Flattery gets you a pencil, not an extension.",s:55}];
        var IMPRESSED=["Okay. That was… actually convincing. I hate that.","I'm writing that one down. For my memoir.","You put thought into that. Where was this energy on Monday?","Fine. Fine! That's the best one this semester.","Hm. I would believe that. Don't make me regret it."];
        var REPEAT=["Didn't we already do this topic? Be creative.","You're recycling excuses. I recycle too, but responsibly.","Same subject twice. I'm starting to see a pattern.","Another one from the same family of lies. Variety, please."];
        var CALLBACK=[function(p){return "First “"+p+"”, now this. Pick a lane."},function(p){return "Hold on. A minute ago it was “"+p+"”."},function(p){return "So “"+p+"” is out the window? Okay."}];
        var GREET=["I'm your teacher, not your friend. Excuse. Now.","Hello. That is not an excuse. Try again."];
        var SHORT=["Focus. That's a word, not an excuse.","I need a story, not a sticky note.","Is that all? I've heard longer sneezes."];
        var GIBBER=["Did you lean on your keyboard?","I've seen cats type better excuses."];
        var LONG=["Fine. I respect the effort. I don't believe it, but I respect it.","That was a lot of words. Some were even convincing. Not all."];
        var DEFAULT=["I don't know what that was, but I'm too tired to argue.","Hm. Specific. I hate that I almost believe it.","Interesting. Wrong, but interesting."];
        var WAIT=["Mr. Pruitt is staring at you…","Mr. Pruitt is polishing his glasses…","Mr. Pruitt is sighing…"];



})();