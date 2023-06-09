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
   const form = document.querySelector("#createForm");
    console.log("form bef", form)
    form.addEventListener("submit", (e) => {
        e.preventDefault();
      
        console.log("#form")
         
        const data = new FormData(form);
    console.log(data)
        fetch("/api/upload", {
            method: "POST",
            body: data,
            //  headers
            headers: {
                // "Content-Type": "multipart/form-data",
            }
  
        }).then(r => r.json()).then((data) => {
            const { files } = data;
            if(files) {
                const { id } = files[0]
                let url = "/files/" + id;
document.getElementById("filelink").href = url;
my_modal_2.showModal();        
            }
        })
})
    }
  })();
  console.debug("[DEBUG] LOADING FILE");
  