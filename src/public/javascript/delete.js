// declare all funcs in an annomous function to avoid global scope

(function() {
    var getScriptURL = (function() {
      var scripts = document.getElementsByTagName("script");
      var index = scripts.length - 1;
      var myScript = scripts[index];
      return function() {
        return myScript.src;
      };
    })();
    const fileName = getScriptURL().split("/").find(e => e.endsWith(".js"));
    console.log("[DEBUG] loading instance for " + fileName);
    // start code after loaded
    window.addEventListener("load", () => {
      console.debug("[DEBUG] starting instance for " + fileName);
      try {
        let proc = main();
        if (proc instanceof Promise) {
          proc.catch(e => console.error(e.message));
        }
      } catch (e) {
        console.error(e.message);
      }
    });
    function main() {
   const form = document.querySelector("#deleteForm");
   const queries = new URLSearchParams(window.location.search);
   if(queries.has("id")){
    const id = queries.get("id");
    let op = form.querySelector("option[value='"+id+"']")
    if(op) op.setAttribute("selected", "selected");
   
    if(queries.has("a") && op) {
        runForm();
    }
   }
   function runForm () {
    console.log("#form")
    const data = new FormData(form);
console.log(data)
    fetch("/api/delete/"+data.get("id"), {
        method: "DELETE"
    }).then(r => r.json()).then((data) => {
my_modal_2.showModal();        
    })
   }
    console.log("form bef", form)
    form.addEventListener("submit", (e) => {
        e.preventDefault();
      runForm ();
})
    }
  })();
  console.debug("[DEBUG] LOADING FILE");
  