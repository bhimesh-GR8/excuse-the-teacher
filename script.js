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
        
    }
})();