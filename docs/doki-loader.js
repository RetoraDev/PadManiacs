document.body.style.visibility = "hidden";

window.onload = function () {
  // List of possible places to find DokiDocs
  const dokiDocsLocations = ["./", "../", "../", "https://cdn.jsdelivr.net/npm/doki-docs@latest/"];

  let currentIndex = 0;

  function tryScript(scriptPath, onSuccess, onError) {
    const minifiedScript = document.createElement("script");
    minifiedScript.src = scriptPath + "doki-docs.min.js";

    window.dokiDocsLocation = scriptPath;
    
    minifiedScript.onload = () => {
      onSuccess && onSuccess(true);
    };
    
    minifiedScript.onerror = () => {
      // If minified fails, try non-minified
      const regularScript = document.createElement("script");
      regularScript.src = scriptPath + "doki-docs.js";

      regularScript.onload = () => {
        onSuccess && onSuccess(false);
      };
      
      regularScript.onerror = () => {
        window.dokiDocsLocation = null;
        
        onError && onError();
      };

      document.head.appendChild(regularScript);
    };

    document.head.appendChild(minifiedScript);
  }

  function tryNext() {
    const target = dokiDocsLocations[currentIndex];
    
    currentIndex ++;
    
    tryScript(target, minified => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = target + (minified ? "doki-docs.min.css" : "doki-docs.css");
      document.head.appendChild(link);
      
      link.onload = () => document.body.style.visibility = "";
    }, () => tryNext());
  }

  tryNext();
};
