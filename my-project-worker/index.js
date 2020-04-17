
class TitleRewriter {
  element(element) {
  }
  text(text) {
    text.replace(text.text.replace("Variant","Jainam Soni's Variant"));
  }
}

class H1Rewriter {
  element(element) {
  }
  text(text) {
    text.replace(text.text.replace("Variant","Jainam Soni's Variant"));
  }
}

class ParaRewriter {
  element(element) {
  }
  text(text) {
    text.replace(text.text.replace("of the take home project!","of Jainam Son's Cloudfare Application"));
  }
}

class URLRewriter {
  constructor(attributeName) {
    this.attributeName = attributeName
  }
 
  element(element) {
    const attribute = element.setAttribute(this.attributeName, "https://www.linkedin.com/in/jainam-soni/");
  }
  text(text) {
    text.replace(text.text.replace("\n              Return to cloudflare.com\n", "Visit my LinkedIn Page!"));
  }
}
const rewriter = new HTMLRewriter()
                .on('title', new TitleRewriter())
                .on('h1[id="title"]', new H1Rewriter())
                .on('p[id="description"]', new ParaRewriter())
                .on('a[id="url"]', new URLRewriter("href"))

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const API_url = "https://cfw-takehome.developers.workers.dev/api/variants";

/**
 * Respond with hello worker text
 * @param {Request} request
 */
function randomVariant()
{
  //generate with 50% probability
  //if rand() generates odd numnber, the function will return 1, otherwise 0
    r = 1000*Math.random() & 1;
    return r;
}

async function handleRequest(request) {
  try {
    const init = {
      method: 'GET',
    };

    var response = await fetch(API_url, init);

    // results is the JSON object returned by the API
    var results = await response.json();
    var returning = false;
    var variant_number;

    let cookies = request.headers.get('Cookie') || ""
    if (cookies.includes("__cfduid")) {
      // User has been here before. Just pass request through.
      // console.log("returningg");
      variant_number = cookies.split(";")[1].split("=")[1];
      returning = true;
    }
    else if (cookies.includes("variant_number")) {
      variant_number = cookies.split("=")[1];
      returning = true;
    }
    else {
      // console.log("not returning");
      variant_number = randomVariant();
    }
    var api_response = await fetch(results["variants"][variant_number], init);

    var edited_response = rewriter.transform(api_response);

    var response_html = await edited_response.text();

    if (returning) {
      return new Response(response_html, {
        headers: { 'content-type': 'text/html'},
      })
    }
    else {
      var responseHeaders = new Response(response_html, {
        headers: { 'content-type': 'text/html',
                    'Set-Cookie' : 'variant_number='+variant_number},
      });

      return responseHeaders;
    }
  }
  catch (err) {
    // Return the error stack as the response
    return new Response(err.stack || err)
  }
}

