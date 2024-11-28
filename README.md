

Intended user flow;

- User enters “orionos.net”
- User inputs “OrionX” as the one-time password
- User signs up with Clerk via custom sign in pages
- User is presented with a pure black screen
- User hovers along the bottom of the screen their cursor to reveal the hidden dock
- User opens the “Stellar” app and uploads a video and 8 dock icons
- User opens the Flow app to reveal the “All Streams” dashboard
- User navigates to; “Apps” -> “Orion” -> “Core” stream -> “Zenith" config flow
- User duplicates the default Zenith config flow and renames to “Daimon”
- User opens the new Flow to reveal the respective Flow Editor
- User selects each respective node, changes its mode to media and connects the appropriate media
- User exits the Editor via “ESC” and closes the Flow app
- User hovers their cursor along the top of the screen to reveal the menu bar
- User clicks the “Flow” icon to reveal the dropdown and selects their new Orion config flow
- User sees the desktop Wallpaper and Dock icons update in real time.


FullStack Discord App Clone Architecture - Our core reference

Project Setup

- ‘*npx create-next-app@latest ./*’
	- TypeScript: Yes
	- Tailwind: Yes
	- ‘app/’: Yes
	- App Router: Yes
- ‘*npx shadcn@latest init*’



Authentication

- ‘npm i @clerk/nextjs’
- Create Clerk app
- Paste .env keys + middleware.ts
- Create custom sign-in/sign-up page and wrap root layout



Dark & Light Theme setup

- ‘npm i next-themes’
- Paste ‘components/theme-provider.tsx’ from ShadCN Docs + wrap root layout
- Paste ‘components/mode-toggle.tsx’ and install ShadCN dropdown-menu component



Prisma & Database setup

- ‘npm i -D prisma’, ‘npm i @prisma/client’, ‘npx prisma init’
- Create NeonDB database, paste .env key
- *Create schema modals*;
	- Profile
	- *Server*
	- Member
	- *Channel*
- ‘npx prisma generate’, ‘npx prisma db push’
- Create ‘/root/lib/*db*.ts’ util file.
- Create ‘/root/lib/*initial-profile*.ts’ to check if the user exists and if not redirect to the sign-in page, and then check if their profile exists, creating one for them if not and returning the profile if one exists.
- Create ‘/root/app/*(setup)/page.tsx*’, import db.ts and initial-profile.ts, create a profile const to await initialProfile(); and then a *server const to await db.server.findFirst where members some profileId: profile.id, returning the user to the serverId page if it exists and displaying an initial server modal if none exist*



Initial server modal UI

  - ‘npx shadcn@latest add; *dialog, input, form*’
  - Create ‘/root/components/modals/*initial-modal*.tsx’, importing *zod, zodResolver, useForm, dialog, input and form and setting up the ReactForm using useForm, zodResolver and formSchema with default values of name and imageUrl and setting up the UI to have a header, instruction message, image upload button with the text “TODO: Image Upload”, form field with a server name input box where onSubmit logs the values in the browser console*



*UploadThing setup*

 - Create Uploadthing app, paste .env keys
 - ‘npm i uploadthing @uploadthing/react react-dropzone’
 - Paste ‘/api/uploadthing/core.ts’ and ‘/api/uploadthing/route.ts’, ‘/lib/uploadthing.ts’ from Uploadthing Docs
 - Add ‘/api/uploadthing' to middleware public routes
 - Replace “TODO: Image Upload” with form field, create ‘/root/components/file-upload.tsx' that can accept either “messageFile” or “serverImage” as its endpoints
 - Add “uploadthing.com” to next config image domains
 - Fill in fields and press create to successfully return this in the browser console; “{name: 'Code With Antonio', imageUrl:"https://uploadthing.com/f/69ab969b-1f0d-4e35-ac3d-48733dd0beb®97e88e49f7b5106952366c19166a259e.webp'} imageUrl: "https://uploadthing.com/f/69ab969b-name: "Code With Antonio"



*Server creation API*

 - ‘npm i axios’
 - import axios into initial-modal and replace the console log function with a try and catch block, resolving the error in the catch and *awaiting axios.post(“/api/servers”, values), resetting the form, refreshing the router and reloading the window.location*
 - Create a ‘/root/lib/*current-profile*’ util file to check the current profile of the user
 - Create ‘/root/app/api/servers/route.ts’, installing ‘npm i uuid’ and importing v4 as uuidv4, current profile, db and NextResponse that creates the users server with their profileId, name, imageUrl, inviteCode and general channel and member of profileId and MemberRole of ADMIN
 - Fill out fields and press create to be redirected to an error 404 page as ‘/root/app/(main)/(routes)/servers/[serverId]/page.tsx doesn’t exist yet




 MACOSICONSAPI MIELISEARCH FILTERS DOCS

 ```
 Search
Meilisearch exposes two routes to perform searches:

A POST route: this is the preferred route when using API authentication, as it allows preflight request caching and better performance
A GET route: the usage of this route is discouraged, unless you have good reason to do otherwise (specific caching abilities for example)
You may find exhaustive descriptions of the parameters accepted by the two routes at the end of this article.

Search in an index with POST
POST
/indexes/{index_uid}/search
Search for documents matching a specific query in the given index.

This is the preferred endpoint to perform search when an API key is required, as it allows for preflight requests to be cached. Caching preflight requests considerably improves search speed.

NOTE
By default, this endpoint returns a maximum of 1000 results. If you want to scrape your database, use the get documents endpoint instead.

Path parameters
Name	Type	Description
index_uid *	String	uid of the requested index
Body
Search Parameter	Type	Default value	Description
q	String	""	Query string
offset	Integer	0	Number of documents to skip
limit	Integer	20	Maximum number of documents returned
hitsPerPage	Integer	1	Maximum number of documents returned for a page
page	Integer	1	Request a specific page of results
filter	String	null	Filter queries by an attribute's value
facets	Array of strings	null	Display the count of matches per facet
attributesToRetrieve	Array of strings	["*"]	Attributes to display in the returned documents
attributesToCrop	Array of strings	null	Attributes whose values have to be cropped
cropLength	Integer	10	Maximum length of cropped value in words
cropMarker	String	"…"	String marking crop boundaries
attributesToHighlight	Array of strings	null	Highlight matching terms contained in an attribute
highlightPreTag	String	"<em>"	String inserted at the start of a highlighted term
highlightPostTag	String	"</em>"	String inserted at the end of a highlighted term
showMatchesPosition	Boolean	false	Return matching terms location
sort	Array of strings	null	Sort search results by an attribute's value
matchingStrategy	String	last	Strategy used to match query terms within documents
showRankingScore	Boolean	false	Display the global ranking score of a document
showRankingScoreDetails	Boolean	false	Adds a detailed global ranking score field
rankingScoreThreshold	Number	null	Excludes results with low ranking scores
attributesToSearchOn	Array of strings	["*"]	Restrict search to the specified attributes
hybrid	Object	null	Return results based on query keywords and meaning
vector	Array of numbers	null	Search using a custom query vector
retrieveVectors	Boolean	false	Return document vector data
locales	Array of strings	null	Explicitly language used in a query
Learn more about how to use each search parameter.

Response
Name	Type	Description
hits	Array of objects	Results of the query
offset	Number	Number of documents skipped
limit	Number	Number of documents to take
estimatedTotalHits	Number	Estimated total number of matches
totalHits	Number	Exhaustive total number of matches
totalPages	Number	Exhaustive total number of search result pages
hitsPerPage	Number	Number of results on each page
page	Number	Current search results page
facetDistribution	Object	Distribution of the given facets
facetStats	Object	The numeric min and max values per facet
processingTimeMs	Number	Processing time of the query
query	String	Query originating the response
Exhaustive and estimated total number of search results
By default, Meilisearch only returns an estimate of the total number of search results in a query: estimatedTotalHits. This happens because Meilisearch prioritizes relevancy and performance over providing an exhaustive number of search results. When working with estimatedTotalHits, use offset and limit to navigate between search results.

If you require the total number of search results, use the hitsPerPage and page search parameters in your query. The response to this query replaces estimatedTotalHits with totalHits and includes an extra field with number of search results pages based on your hitsPerPage: totalPages. Using totalHits and totalPages may result in slightly reduced performance, but is recommended when creating UI elements such as numbered page selectors.

Neither estimatedTotalHits nor totalHits can exceed the limit configured in the maxTotalHits index setting.

You can read more about pagination in our dedicated guide.

Example
cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{ "q": "american ninja" }'

Response: 200 Ok
json
{
  "hits": [
    {
      "id": 2770,
      "title": "American Pie 2",
      "poster": "https://image.tmdb.org/t/p/w1280/q4LNgUnRfltxzp3gf1MAGiK5LhV.jpg",
      "overview": "The whole gang are back and as close as ever. They decide to get even closer by spending the summer together at a beach house. They decide to hold the biggest…",
      "release_date": 997405200
    },
    {
      "id": 190859,
      "title": "American Sniper",
      "poster": "https://image.tmdb.org/t/p/w1280/svPHnYE7N5NAGO49dBmRhq0vDQ3.jpg",
      "overview": "U.S. Navy SEAL Chris Kyle takes his sole mission—protect his comrades—to heart and becomes one of the most lethal snipers in American history. His pinpoint accuracy not only saves countless lives but also makes him a prime…",
      "release_date": 1418256000
    },
    …
  ],
  "offset": 0,
  "limit": 20,
  "estimatedTotalHits": 976,
  "processingTimeMs": 35,
  "query": "american "
}

Search in an index with GET
GET
/indexes/{index_uid}/search
Search for documents matching a specific query in the given index.

WARNING
This endpoint only accepts string filter expressions.

This endpoint should only be used when no API key is required. If an API key is required, use the POST route instead.

NOTE
By default, this endpoint returns a maximum of 1000 results. If you want to scrape your database, use the get documents endpoint instead.

Path parameters
Name	Type	Description
index_uid *	String	uid of the requested index
Query parameters
Search Parameter	Type	Default value	Description
q	String	""	Query string
offset	Integer	0	Number of documents to skip
limit	Integer	20	Maximum number of documents returned
hitsPerPage	Integer	1	Maximum number of documents returned for a page
page	Integer	1	Request a specific page of results
filter	String	null	Filter queries by an attribute's value
facets	Array of strings	null	Display the count of matches per facet
attributesToRetrieve	Array of strings	["*"]	Attributes to display in the returned documents
attributesToCrop	Array of strings	null	Attributes whose values have to be cropped
cropLength	Integer	10	Maximum length of cropped value in words
cropMarker	String	"…"	String marking crop boundaries
attributesToHighlight	Array of strings	null	Highlight matching terms contained in an attribute
highlightPreTag	String	"<em>"	String inserted at the start of a highlighted term
highlightPostTag	String	"</em>"	String inserted at the end of a highlighted term
showMatchesPosition	Boolean	false	Return matching terms location
sort	Array of strings	null	Sort search results by an attribute's value
matchingStrategy	String	last	Strategy used to match query terms within documents
showRankingScore	Boolean	false	Display the global ranking score of a document
showRankingScoreDetails	Boolean	false	Adds a detailed global ranking score field
rankingScoreThreshold	Number	null	Excludes results with low ranking scores
attributesToSearchOn	Array of strings	["*"]	Restrict search to the specified attributes
hybrid	Object	null	Return results based on query keywords and meaning
vector	Array of numbers	null	Search using a custom query vector
retrieveVectors	Boolean	false	Return document vector data
locales	Array of strings	null	Explicitly language used in a query
Learn more about how to use each search parameter.

Response
Name	Type	Description
hits	Array of objects	Results of the query
offset	Number	Number of documents skipped
limit	Number	Number of documents to take
estimatedTotalHits	Number	Estimated total number of matches
totalHits	Number	Exhaustive total number of matches
totalPages	Number	Exhaustive total number of search result pages
hitsPerPage	Number	Number of results on each page
page	Number	Current search results page
facetDistribution	Object	Distribution of the given facets
facetStats	Object	The numeric min and max values per facet
processingTimeMs	Number	Processing time of the query
query	String	Query originating the response
Example
cURL
JS
Dart
curl \
  -X GET 'http://localhost:7700/indexes/movies/search?q=american%20ninja'

Response: 200 Ok
json
{
  "hits": [
    {
      "id": 2770,
      "title": "American Pie 2",
      "poster": "https://image.tmdb.org/t/p/w1280/q4LNgUnRfltxzp3gf1MAGiK5LhV.jpg",
      "overview": "The whole gang are back and as close as ever. They decide to get even closer by spending the summer together at a beach house. They decide to hold the biggest…",
      "release_date": 997405200
    },
    {
      "id": 190859,
      "title": "American Sniper",
      "poster": "https://image.tmdb.org/t/p/w1280/svPHnYE7N5NAGO49dBmRhq0vDQ3.jpg",
      "overview": "U.S. Navy SEAL Chris Kyle takes his sole mission—protect his comrades—to heart and becomes one of the most lethal snipers in American history. His pinpoint accuracy not only saves countless lives but also makes him a prime…",
      "release_date": 1418256000
    },
    …
  ],
  "offset": 0,
  "limit": 20,
  "estimatedTotalHits": 976,
  "processingTimeMs": 35,
  "query": "american "
}

Search parameters
Here follows an exhaustive description of each search parameter currently available when using the search endpoint. Unless otherwise noted, all parameters are valid for the GET /indexes/{index_uid}/search, POST /indexes/{index_uid}/search, and /multi-search routes.

WARNING
If using the GET route to perform a search, all parameters must be URL-encoded.

This is not necessary when using the POST route or one of our SDKs.

Overview
Search Parameter	Type	Default value	Description
q	String	""	Query string
offset	Integer	0	Number of documents to skip
limit	Integer	20	Maximum number of documents returned
hitsPerPage	Integer	1	Maximum number of documents returned for a page
page	Integer	1	Request a specific page of results
filter	Array of strings	null	Filter queries by an attribute's value
facets	Array of strings	null	Display the count of matches per facet
attributesToRetrieve	Array of strings	["*"]	Attributes to display in the returned documents
attributesToCrop	Array of strings	null	Attributes whose values have to be cropped
cropLength	Integer	10	Maximum length of cropped value in words
cropMarker	String	"…"	String marking crop boundaries
attributesToHighlight	Array of strings	null	Highlight matching terms contained in an attribute
highlightPreTag	String	"<em>"	String inserted at the start of a highlighted term
highlightPostTag	String	"</em>"	String inserted at the end of a highlighted term
showMatchesPosition	Boolean	false	Return matching terms location
sort	Array of strings	null	Sort search results by an attribute's value
matchingStrategy	String	last	Strategy used to match query terms within documents
showRankingScore	Boolean	false	Display the global ranking score of a document
attributesToSearchOn	Array of strings	["*"]	Restrict search to the specified attributes
hybrid	Object	null	Return results based on query keywords and meaning
vector	Array of numbers	null	Search using a custom query vector
retrieveVectors	Boolean	false	Return document vector data
locales	Array of strings	null	Explicitly language used in a query
Query (q)
Parameter: q
Expected value: Any string
Default value: null

Sets the search terms.

WARNING
Meilisearch only considers the first ten words of any given search query. This is necessary in order to deliver a fast search-as-you-type experience.

Example
You can search for films mentioning shifu by setting the q parameter:

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{ "q": "shifu" }'

This will give you a list of documents that contain your query terms in at least one attribute.

json
{
  "hits": [
    {
      "id": 50393,
      "title": "Kung Fu Panda Holiday",
      "poster": "https://image.tmdb.org/t/p/w500/rV77WxY35LuYLOuQvBeD1nyWMuI.jpg",
      "overview": "The Winter Feast is Po's favorite holiday. Every year he and his father hang decorations, cook together, and serve noodle soup to the villagers. But this year Shifu informs Po that as Dragon Warrior, it is his duty to host the formal Winter Feast at the Jade Palace.",
      "release_date": 1290729600,
      "genres": [
        "Animation",
        "Family",
        "TV Movie"
      ]
    }
  ],
  "query": "shifu"
}

Query term normalization
Query terms go through a normalization process that removes non-spacing marks. Because of this, Meilisearch effectively ignores accents and diacritics when returning results. For example, searching for "sábia" returns documents containing "sábia", "sabiá", and "sabia".

Normalization also converts all letters to lowercase. Searching for "Video" returns the same results as searching for "video", "VIDEO", or "viDEO".

Placeholder search
When q isn't specified, Meilisearch performs a placeholder search. A placeholder search returns all searchable documents in an index, modified by any search parameters used and sorted by that index's custom ranking rules. Since there is no query term, the built-in ranking rules do not apply.

If the index has no sort or custom ranking rules, the results are returned in the order of their internal database position.

TIP
Placeholder search is particularly useful when building a faceted search interfaces, as it allows users to view the catalog and alter sorting rules without entering a query.

Phrase search
If you enclose search terms in double quotes ("), Meilisearch will only return documents containing those terms in the order they were given. This is called a phrase search.

Phrase searches are case-insensitive and ignore soft separators such as -, ,, and :. Using a hard separator within a phrase search effectively splits it into multiple separate phrase searches: "Octavia.Butler" will return the same results as "Octavia" "Butler".

You can combine phrase search and normal queries in a single search request. In this case, Meilisearch will first fetch all documents with exact matches to the given phrase(s), and then proceed with its default behavior.

Example
cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
--data-binary '{ "q": "\"african american\" horror" }'

Negative search
Use the minus (-) operator in front of a word or phrase to exclude it from search results.

Example
The following query returns all documents that do not include the word "escape":

cURL
JS
PHP
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{ "q": "-escape" }'

Negative search can be used together with phrase search:

cURL
JS
PHP
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{ "q": "-\"escape room\"" }'

Offset
Parameter: offset
Expected value: Any positive integer
Default value: 0

Sets the starting point in the search results, effectively skipping over a given number of documents.

Queries using offset and limit only return an estimate of the total number of search results.

You can paginate search results by making queries combining both offset and limit.

WARNING
Setting offset to a value greater than an index's maxTotalHits returns an empty array.

Example
If you want to skip the first result in a query, set offset to 1:

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "shifu",
    "offset": 1
  }'

Limit
Parameter: limit
Expected value: Any positive integer
Default value: 20

Sets the maximum number of documents returned by a single query.

You can paginate search results by making queries combining both offset and limit.

WARNING
A search query cannot return more results than configured in maxTotalHits, even if the value of limit is greater than the value of maxTotalHits.

Example
If you want your query to return only two documents, set limit to 2:

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "shifu",
    "limit": 2
  }'

Number of results per page
Parameter: hitsPerPage
Expected value: Any positive integer
Default value: 20

Sets the maximum number of documents returned for a single query. The value configured with this parameter dictates the number of total pages: if Meilisearch finds a total of 20 matches for a query and your hitsPerPage is set to 5, totalPages is 4.

Queries containing hitsPerPage are exhaustive and do not return an estimatedTotalHits. Instead, the response body will include totalHits and totalPages.

If you set hitsPerPage to 0, Meilisearch processes your request, but does not return any documents. In this case, the response body will include the exhaustive value for totalHits. The response body will also include totalPages, but its value will be 0.

You can use hitsPerPage and page to paginate search results.

NOTE
hitsPerPage and page take precedence over offset and limit. If a query contains either hitsPerPage or page, any values passed to offset and limit are ignored.

WARNING
hitsPerPage and page are resource-intensive options and might negatively impact search performance. This is particularly likely if maxTotalHits is set to a value higher than its default.

Example
The following example returns the first 15 results for a query:

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "",
    "hitsPerPage": 15
  }'

Page
Parameter: page
Expected value: Any positive integer
Default value: 1

Requests a specific results page. Pages are calculated using the hitsPerPage search parameter.

Queries containing page are exhaustive and do not return an estimatedTotalHits. Instead, the response body will include two new fields: totalHits and totalPages.

If you set page to 0, Meilisearch processes your request, but does not return any documents. In this case, the response body will include the exhaustive values for facetDistribution, totalPages, and totalHits.

You can use hitsPerPage and page to paginate search results.

NOTE
hitsPerPage and page take precedence over offset and limit. If a query contains either hitsPerPage or page, any values passed to offset and limit are ignored.

WARNING
hitsPerPage and page are resource-intensive options and might negatively impact search performance. This is particularly likely if maxTotalHits is set to a value higher than its default.

Example
The following example returns the second page of search results:

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "",
    "page": 2
  }'

Filter
Parameter: filter
Expected value: A filter expression written as a string or an array of strings
Default value: []

Uses filter expressions to refine search results. Attributes used as filter criteria must be added to the filterableAttributes list.

For more information, read our guide on how to use filters and build filter expressions.

Example
You can write a filter expression in string syntax using logical connectives:

"(genres = horror OR genres = mystery) AND director = 'Jordan Peele'"

You can write the same filter as an array:

[["genres = horror", "genres = mystery"], "director = 'Jordan Peele'"]

You can then use the filter in a search query:

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "thriller",
    "filter": [
      [
        "genres = Horror",
        "genres = Mystery"
      ],
      "director = \"Jordan Peele\""
    ]
  }'

Filtering results with _geoRadius and _geoBoundingBox
If your documents contain _geo data, you can use the _geoRadius and _geoBoundingBox built-in filter rules to filter results according to their geographic position.

_geoRadius
_geoBoundingBox
_geoRadius establishes a circular area based on a central point and a radius. This filter rule requires three parameters: lat, lng and distance_in_meters.

json
_geoRadius(lat, lng, distance_in_meters)

lat and lng should be geographic coordinates expressed as floating point numbers. distance_in_meters indicates the radius of the area within which you want your results and should be an integer.

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/restaurants/search' \
  -H 'Content-type:application/json' \
  --data-binary '{ "filter": "_geoRadius(45.472735, 9.184019, 2000)" }'

If any parameters are invalid or missing, Meilisearch returns an invalid_search_filter error.

Facets
Parameter: facets
Expected value: An array of attributes or ["*"]
Default value: null Returns the number of documents matching the current search query for each given facet. This parameter can take two values:

An array of attributes: facets=["attributeA", "attributeB", …]
An asterisk—this will return a count for all facets present in filterableAttributes
By default, facets returns a maximum of 100 facet values for each faceted field. You can change this value using the maxValuesPerFacet property of the faceting index settings.

When facets is set, the search results object includes the facetDistribution and facetStats fields.

NOTE
If an attribute used on facets has not been added to the filterableAttributes list, it will be ignored.

facetDistribution
facetDistribution contains the number of matching documents distributed among the values of a given facet. Each facet is represented as an object:

json
{
  …
 "facetDistribution": {
    "FACET_A": {
      "FACET_VALUE_X": 6,
      "FACET_VALUE_Y": 1,
    },
    "FACET_B": {
      "FACET_VALUE_Z": 3,
      "FACET_VALUE_W": 9,
    },
  },
  …
}

facetDistribution contains an object for every attribute passed to the facets parameter. Each object contains the returned values for that attribute and the count of matching documents with that value. Meilisearch does not return empty facets.

TIP
facetStats
facetStats contains the lowest (min) and highest (max) numerical values across all documents in each facet. Only numeric values are considered:

json
{
  …
"facetStats":{
  "rating":{
    "min":2.5,
    "max":4.7
    }
  }
  …
}

If none of the matching documents have a numeric value for a facet, that facet is not included in the facetStats object. facetStats ignores string values, even if the string contains a number.

Example
Given a movie ratings database, the following code sample returns the number of Batman movies per genre along with the minimum and maximum ratings:

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movie_ratings/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "Batman",
    "facets": ["genres", "rating"]
  }'

The response shows the facet distribution for genres and rating. Since rating is a numeric field, you get its minimum and maximum values in facetStats.

json
{
  …
  "estimatedTotalHits":22,
  "query":"Batman",
  "facetDistribution":{
    "genres":{
      "Action":20,
      "Adventure":7,
      …
      "Thriller":3
    },
    "rating":{
      "2":1,
      …
      "9.8":1
    }
  },
  "facetStats":{
    "rating":{
      "min":2.0,
      "max":9.8
    }
  }
}

Learn more about facet distribution in the faceted search guide.

Distinct attributes at search time
Parameter: distinct
Expected value: An attribute present in the filterableAttributes list
Default value: null

Defines one attribute in the filterableAttributes list as a distinct attribute. Distinct attributes indicate documents sharing the same value for the specified field are equivalent and only the most relevant one should be returned in search results.

This behavior is similar to the distinctAttribute index setting, but can be configured at search time. distinctAttribute acts as a default distinct attribute value you may override with distinct.

Examples
cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
curl \
  -X POST 'http://localhost:7700/indexes/INDEX_NAME/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "QUERY TERMS",
    "distinct": "ATTRIBUTE_A"
  }'

Attributes to retrieve
Parameter: attributesToRetrieve
Expected value: An array of attributes or ["*"]
Default value: ["*"]

Configures which attributes will be retrieved in the returned documents.

If no value is specified, attributesToRetrieve uses the displayedAttributes list, which by default contains all attributes found in the documents.

NOTE
If an attribute has been removed from displayedAttributes, attributesToRetrieve will silently ignore it and the field will not appear in your returned documents.

Example
To get only the overview and title fields, set attributesToRetrieve to ["overview", "title"].

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "shifu",
    "attributesToRetrieve": [
      "overview",
      "title"
    ]
  }'

Attributes to crop
Parameter: attributesToCrop
Expected value: An array of attributes or ["*"]
Default value: null

Crops the selected fields in the returned results to the length indicated by the cropLength parameter. When attributesToCrop is set, each returned document contains an extra field called _formatted. This object contains the cropped version of the selected attributes.

By default, crop boundaries are marked by the ellipsis character (…). You can change this by using the cropMarker search parameter.

Optionally, you can indicate a custom crop length for any attributes given to attributesToCrop: attributesToCrop=["attributeNameA:5", "attributeNameB:9"]. If configured, these values have priority over cropLength.

Instead of supplying individual attributes, you can provide ["*"] as a wildcard: attributesToCrop=["*"]. This causes _formatted to include the cropped values of all attributes present in attributesToRetrieve.

Cropping algorithm
Suppose you have a field containing the following string: Donatello is a skilled and smart turtle. Leonardo is the most skilled turtle. Raphael is the strongest turtle.

Meilisearch tries to respect sentence boundaries when cropping. For example, if your search term is Leonardo and your cropLength is 6, Meilisearch will prioritize keeping the sentence together and return: Leonardo is the most skilled turtle.

If a query contains only a single search term, Meilisearch crops around the first occurrence of that term. If you search for turtle and your cropLength is 7, Meilisearch will return the first instance of that word: Donatello is a skilled and smart turtle.

If a query contains multiple search terms, Meilisearch centers the crop around the largest number of unique matches, giving priority to terms that are closer to each other and follow the original query order. If you search for skilled turtle with a cropLength of 6, Meilisearch will return Leonardo is the most skilled turtle.

If Meilisearch does not find any query terms in a field, cropping begins at the first word in that field. If you search for Michelangelo with a cropLength of 4 and this string is present in another field, Meilisearch will return Donatello is a skilled ….

Example
If you use shifu as a search query and set the value of the cropLength parameter to 5:

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "shifu",
    "attributesToCrop": ["overview"],
    "cropLength": 5
  }'

You will get the following response with the cropped text in the _formatted object:

json
{
  "id": 50393,
  "title": "Kung Fu Panda Holiday",
  "poster": "https://image.tmdb.org/t/p/w1280/gp18R42TbSUlw9VnXFqyecm52lq.jpg",
  "overview": "The Winter Feast is Po's favorite holiday. Every year he and his father hang decorations, cook together, and serve noodle soup to the villagers. But this year Shifu informs Po that as Dragon Warrior, it is his duty to host the formal Winter Feast at the Jade Palace. Po is caught between his obligations as the Dragon Warrior and his family traditions: between Shifu and Mr. Ping.",
  "release_date": 1290729600,
  "_formatted": {
    "id": 50393,
    "title": "Kung Fu Panda Holiday",
    "poster": "https://image.tmdb.org/t/p/w1280/gp18R42TbSUlw9VnXFqyecm52lq.jpg",
    "overview": "…this year Shifu informs Po…",
    "release_date": 1290729600
  }
}

Crop length
Parameter: cropLength
Expected value: A positive integer
Default value: 10

Configures the total number of words to appear in the cropped value when using attributesToCrop. If attributesToCrop is not configured, cropLength has no effect on the returned results.

Query terms are counted as part of the cropped value length. If cropLength is set to 2 and you search for one term (for example, shifu), the cropped field will contain two words in total (for example, "…Shifu informs…").

Stop words are also counted against this number. If cropLength is set to 2 and you search for one term (for example, grinch), the cropped result may contain a stop word (for example, "…the Grinch…").

If attributesToCrop uses the attributeName:number syntax to specify a custom crop length for an attribute, that value has priority over cropLength.

Crop marker
Parameter: cropMarker
Expected value: A string
Default value: "…"

Sets a string to mark crop boundaries when using the attributesToCrop parameter. The crop marker will be inserted on both sides of the crop. If attributesToCrop is not configured, cropMarker has no effect on the returned search results.

If cropMarker is set to null or an empty string, no markers will be included in the returned results.

Crop markers are only added where content has been removed. For example, if the cropped text includes the first word of the field value, the crop marker will not be added to the beginning of the cropped result.

Example
When searching for shifu, you can use cropMarker to change the default …:

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "shifu",
    "cropMarker": "[…]",
    "attributesToCrop": ["overview"]
  }'

json
{
  "id": 50393,
  "title": "Kung Fu Panda Holiday",
  "poster": "https://image.tmdb.org/t/p/w1280/gp18R42TbSUlw9VnXFqyecm52lq.jpg",
  "overview": "The Winter Feast is Po's favorite holiday. Every year he and his father hang decorations, cook together, and serve noodle soup to the villagers. But this year Shifu informs Po that as Dragon Warrior, it is his duty to host the formal Winter Feast at the Jade Palace. Po is caught between his obligations as the Dragon Warrior and his family traditions: between Shifu and Mr. Ping.",
  "release_date": 1290729600,
  "_formatted": {
    "id": 50393,
    "title": "Kung Fu Panda Holiday",
    "poster": "https://image.tmdb.org/t/p/w1280/gp18R42TbSUlw9VnXFqyecm52lq.jpg",
    "overview": "[…]But this year Shifu informs Po that as Dragon Warrior,[…]",
    "release_date": 1290729600
  }
}

Attributes to highlight
Parameter: attributesToHighlight
Expected value: An array of attributes or ["*"]
Default value: null

Highlights matching query terms in the specified attributes. attributesToHighlight only works on values of the following types: string, number, array, object.

When this parameter is set, returned documents include a _formatted object containing the highlighted terms.

Instead of a list of attributes, you can use ["*"]: attributesToHighlight=["*"]. In this case, all the attributes present in attributesToRetrieve will be assigned to attributesToHighlight.

By default highlighted elements are enclosed in <em> and </em> tags. You may change this by using the highlightPreTag and highlightPostTag search parameters.

NOTE
attributesToHighlight also highlights terms configured as synonyms and stop words.

WARNING
attributesToHighlight will highlight matches within all attributes added to the attributesToHighlight array, even if those attributes are not set as searchableAttributes.

Example
The following query highlights matches present in the overview attribute:

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "winter feast",
    "attributesToHighlight": ["overview"]
  }'

The highlighted version of the text would then be found in the _formatted object included in each returned document:

json
{
  "id": 50393,
  "title": "Kung Fu Panda Holiday",
  "poster": "https://image.tmdb.org/t/p/w1280/gp18R42TbSUlw9VnXFqyecm52lq.jpg",
  "overview": "The Winter Feast is Po's favorite holiday. Every year he and his father hang decorations, cook together, and serve noodle soup to the villagers. But this year Shifu informs Po that as Dragon Warrior, it is his duty to host the formal Winter Feast at the Jade Palace. Po is caught between his obligations as the Dragon Warrior and his family traditions: between Shifu and Mr. Ping.",
  "release_date": 1290729600,
  "_formatted": {
    "id": 50393,
    "title": "Kung Fu Panda Holiday",
    "poster": "https://image.tmdb.org/t/p/w1280/gp18R42TbSUlw9VnXFqyecm52lq.jpg",
    "overview": "The <em>Winter Feast</em> is Po's favorite holiday. Every year he and his father hang decorations, cook together, and serve noodle soup to the villagers. But this year Shifu informs Po that as Dragon Warrior, it is his duty to host the formal <em>Winter Feast</em> at the Jade Palace. Po is caught between his obligations as the Dragon Warrior and his family traditions: between Shifu and Mr. Ping.",
    "release_date": 1290729600
  }
}

Highlight tags
Parameters: highlightPreTag and highlightPostTag
Expected value: A string
Default value: "<em>" and "</em>" respectively

highlightPreTag and highlightPostTag configure, respectively, the strings to be inserted before and after a word highlighted by attributesToHighlight. If attributesToHighlight has not been configured, highlightPreTag and highlightPostTag have no effect on the returned search results.

It is possible to use highlightPreTag and highlightPostTag to enclose terms between any string of text, not only HTML tags: "<em>", "<strong>", "*", and "__" are all equally supported values.

If highlightPreTag or highlightPostTag are set to null or an empty string, nothing will be inserted respectively at the beginning or the end of a highlighted term.

Example
The following query encloses highlighted matches in <span> tags with a class attribute:

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "winter feast",
    "attributesToHighlight": ["overview"],
    "highlightPreTag": "<span class=\"highlight\">",
    "highlightPostTag": "</span>"
  }'

You can find the highlighted query terms inside the _formatted property:

json
{
  "id": 50393,
  "title": "Kung Fu Panda Holiday",
  "poster": "https://image.tmdb.org/t/p/w1280/gp18R42TbSUlw9VnXFqyecm52lq.jpg",
  "overview": "The Winter Feast is Po's favorite holiday. Every year he and his father hang decorations, cook together, and serve noodle soup to the villagers. But this year Shifu informs Po that as Dragon Warrior, it is his duty to host the formal Winter Feast at the Jade Palace. Po is caught between his obligations as the Dragon Warrior and his family traditions: between Shifu and Mr. Ping.",
  "release_date": 1290729600,
  "_formatted": {
    "id": 50393,
    "title": "Kung Fu Panda Holiday",
    "poster": "https://image.tmdb.org/t/p/w1280/gp18R42TbSUlw9VnXFqyecm52lq.jpg",
    "overview": "The <span class=\"highlight\">Winter Feast</span> is Po's favorite holiday. Every year he and his father hang decorations, cook together, and serve noodle soup to the villagers. But this year Shifu informs Po that as Dragon Warrior, it is his duty to host the formal <span class=\"highlight\">Winter Feast</span> at the Jade Palace. Po is caught between his obligations as the Dragon Warrior and his family traditions: between Shifu and Mr. Ping.",
    "release_date": 1290729600
  }
}

DANGER
Though it is not necessary to use highlightPreTag and highlightPostTag in conjunction, be careful to ensure tags are correctly matched. In the above example, not setting highlightPostTag would result in malformed HTML: <span>Winter Feast</em>.

Show matches position
Parameter: showMatchesPosition
Expected value: true or false
Default value: false

Adds a _matchesPosition object to the search response that contains the location of each occurrence of queried terms across all fields. This is useful when you need more control than offered by our built-in highlighting. showMatchesPosition only works for strings, numbers, and arrays of strings and numbers.

WARNING
showMatchesPosition returns the location of matched query terms within all attributes, even attributes that are not set as searchableAttributes.

The beginning of a matching term within a field is indicated by start, and its length by length.

WARNING
start and length are measured in bytes and not the number of characters. For example, ü represents two bytes but one character.

Example
If you set showMatchesPosition to true and search for winter feast:

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "winter feast",
    "showMatchesPosition": true
  }'

You would get the following response with information about the matches in the _matchesPosition object. Note how Meilisearch searches for winter and feast separately because of the whitespace:

json
{
  "id": 50393,
  "title": "Kung Fu Panda Holiday",
  "poster": "https://image.tmdb.org/t/p/w500/rV77WxY35LuYLOuQvBeD1nyWMuI.jpg",
  "overview": "The Winter Feast is Po's favorite holiday. Every year he and his father hang decorations, cook together, and serve noodle soup to the villagers. But this year Shifu informs Po that as Dragon Warrior, it is his duty to host the formal Winter Feast at the Jade Palace. Po is caught between his obligations as the Dragon Warrior and his family traditions: between Shifu and Mr. Ping.",
  "release_date": 1290729600,
  "_matchesPosition": {
    "overview": [
      {
        "start": 4,
        "length": 6
      },
      {
        "start": 11,
        "length": 5
      },
      {
        "start": 234,
        "length": 6
      },
      {
        "start": 241,
        "length": 5
      }
    ]
  }
}

Sort
Parameter: sort
Expected value: A list of attributes written as an array or as a comma-separated string
Default value: null

Sorts search results at query time according to the specified attributes and indicated order.

Each attribute in the list must be followed by a colon (:) and the preferred sorting order: either ascending (asc) or descending (desc).

NOTE
Attribute order is meaningful. The first attributes in a list will be given precedence over those that come later.

For example, sort="price:asc,author:desc will prioritize price over author when sorting results.

When using the POST route, sort expects an array of strings.

When using the GET route, sort expects the list as a comma-separated string.

Read more about sorting search results in our dedicated guide.

Example
You can search for science fiction books ordered from cheapest to most expensive:

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/books/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "science fiction",
    "sort": ["price:asc"]
  }'

Sorting results with _geoPoint
When dealing with documents containing geolocation data, you can use _geoPoint to sort results based on their distance from a specific geographic location.

_geoPoint is a sorting function that requires two floating point numbers indicating a location's latitude and longitude. You must also specify whether the sort should be ascending (asc) or descending (desc):

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/restaurants/search' \
  -H 'Content-type:application/json' \
  --data-binary '{ "sort": ["_geoPoint(48.8561446,2.2978204):asc"] }'

Queries using _geoPoint will always include a geoDistance field containing the distance in meters between the document location and the _geoPoint:

json
[
  {
    "id": 1,
    "name": "Nàpiz' Milano",
    "_geo": {
      "lat": 45.4777599,
      "lng": 9.1967508
    },
    "_geoDistance": 1532
  }
]

You can read more about location-based sorting in our dedicated guide.

Matching strategy
Parameter: matchingStrategy
Expected value: last, all, or frequency
Default value: last

Defines the strategy used to match query terms in documents.

last
last returns documents containing all the query terms first. If there are not enough results containing all query terms to meet the requested limit, Meilisearch will remove one query term at a time, starting from the end of the query.

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "big fat liar",
    "matchingStrategy": "last"
  }'

With the above code sample, Meilisearch will first return documents that contain all three words. If the results don't meet the requested limit, it will also return documents containing only the first two terms, big fat, followed by documents containing only big.

all
all only returns documents that contain all query terms. Meilisearch will not match any more documents even if there aren't enough to meet the requested limit.

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "big fat liar",
    "matchingStrategy": "all"
  }'

The above code sample would only return documents containing all three words.

frequency
frequency returns documents containing all the query terms first. If there are not enough results containing all query terms to meet the requested limit, Meilisearch will remove one query term at a time, starting with the word that is the most frequent in the dataset. frequency effectively gives more weight to terms that appear less frequently in a set of results.

cURL
JS
Python
PHP
Java
Ruby
Go
Rust
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "white shirt",
    "matchingStrategy": "frequency"
  }'

In a dataset where many documents contain the term "shirt", the above code sample would prioritize documents containing "white".

Ranking score
Parameter: showRankingScore
Expected value: true or false
Default value: false

Adds a global ranking score field, _rankingScore, to each document. The _rankingScore is a numeric value between 0.0 and 1.0. The higher the _rankingScore, the more relevant the document.

The sort ranking rule does not influence the _rankingScore. Instead, the document order is determined by the value of the field they are sorted on.

NOTE
A document's ranking score does not change based on the scores of other documents in the same index.

For example, if a document A has a score of 0.5 for a query term, this value remains constant no matter the score of documents B, C, or D.

Example
The code sample below returns the _rankingScore when searching for dragon in movies:

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "dragon",
    "showRankingScore": true
  }'

json
{
  "hits": [
    {
      "id": 31072,
      "title": "Dragon",
      "overview": "In a desperate attempt to save her kingdom…",
      …
      "_rankingScore": 0.92
    },
    {
      "id": 70057,
      "title": "Dragon",
      "overview": "A sinful martial arts expert wants…",
      …
      "_rankingScore": 0.91
    },
    …
  ],
  …
}

Ranking score details
Parameter: showRankingScoreDetails
Expected value: true or false
Default value: false

Adds a detailed global ranking score field, _rankingScoreDetails, to each document. _rankingScoreDetails is an object containing a nested object for each active ranking rule.

Ranking score details object
Each ranking rule details its score in its own object. Fields vary per ranking rule.

words
order: order in which this ranking rule was applied
score: ranking score for this rule
matchingWords: number of words in the query that match in the document
maxMatchingWords: maximum number of words in the query that can match in the document
typo
order: order in which this specific ranking rule was applied
score: ranking score for this rule
typoCount: number of typos corrected so that the document matches the query term
maxTypoCount: maximum number of typos accepted
proximity
order: order in which this ranking rule was applied
score: ranking score for this rule
attribute
order: order in which this ranking rule was applied
score: ranking score for this rule
attributeRankingOrderScore: score computed from the maximum attribute ranking order for the matching attributes
queryWordDistanceScore: score computed from the distance between the position words in the query and the position of words in matched attributes
exactness
order: order in which this ranking rule was applied
score: ranking score for this rule
matchType: either exactMatch, matchesStart, or noExactMatch:
exactMatch: document contains an attribute matching all query terms with no other words between them and in the order they were given
matchesStart: document contains an attribute with all query terms in the same order as the original query
noExactMatch: document contains an attribute with at least one query term matching the original query
matchingWords: the number of exact matches in an attribute when matchType is noExactMatch
maxMatchingWords: the maximum number of exact matches in an attribute when matchType is noExactMatch
field_name:direction
The sort ranking rule does not appear as a single field in the score details object. Instead, each sorted attribute appears as its own field, followed by a colon (:) and the sorting direction: attribute:direction.

order: order in which this ranking rule was applied
value: value of the field used for sorting
_geoPoint(lat:lng):direction
order: order in which this ranking rule was applied
value: value of the field used for sorting
distance: same as _geoDistance
vectorSort(target_vector)
order: order in which this specific ranking rule was applied
value: vector used for sorting the document
similarity: similarity score between the target vector and the value vector. 1.0 means a perfect similarity, 0.0 a perfect dissimilarity
Example
The code sample below returns the _rankingScoreDetail when searching for dragon in movies:

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "dragon",
    "showRankingScoreDetails": true
  }'

json
{
  "hits": [
    {
      "id": 31072,
      "title": "Dragon",
      "overview": "In a desperate attempt to save her kingdom…",
      …
      "_rankingScoreDetails": {
        "words": {
          "order": 0,
          "matchingWords": 4,
          "maxMatchingWords": 4,
          "score": 1.0
        },
        "typo": {
          "order": 2,
          "typoCount": 1,
          "maxTypoCount": 4,
          "score": 0.75
        },
        "name:asc": {
          "order": 1,
          "value": "Dragon"
        }
      }
    },
    …
  ],
  …
}

Ranking score threshold
Parameter: rankingScoreThreshold
Expected value: A number between 0.0 and 1.0
Default value: null

Excludes results below the specified ranking score.

Excluded results do not count towards estimatedTotalHits, totalHits, and facet distribution.

`rankingScoreThreshold` and `limit`
For performance reasons, if the number of documents above rankingScoreThreshold is higher than limit, Meilisearch does not evaluate the ranking score of the remaining documents. Results ranking below the threshold are not immediately removed from the set of candidates. In this case, Meilisearch may overestimate the count of estimatedTotalHits, totalHits and facet distribution.

Example
The following query only returns results with a ranking score bigger than 0.2:

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
curl \
-X POST 'http://localhost:7700/indexes/INDEX_NAME/search' \
-H 'Content-Type: application/json' \
--data-binary '{
    "q": "badman",
    "rankingScoreThreshold": 0.2
}'

Customize attributes to search on at search time
Parameter: attributesToSearchOn
Expected value: A list of searchable attributes written as an array
Default value: ["*"]

Configures a query to only look for terms in the specified attributes.

Instead of a list of attributes, you can pass a wildcard value (["*"]) and null to attributesToSearchOn. In both cases, Meilisearch will search for matches in all searchable attributes.

WARNING
Attributes passed to attributesToSearchOn must also be present in the searchableAttributes list.

The order of attributes in attributesToSearchOn does not affect relevancy.

Example
The following query returns documents whose overview includes "adventure":

cURL
JS
Python
PHP
Java
Ruby
Go
C#
Rust
Swift
Dart
curl \
  -X POST 'http://localhost:7700/indexes/movies/search' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "q": "adventure",
    "attributesToSearchOn": ["overview"]
  }'

Results would not include documents containing "adventure" in other fields such as title or genre, even if these fields were present in the searchableAttributes list.

Hybrid search (experimental)
Parameter: hybrid
Expected value: An object with two fields: embedder and semanticRatio
Default value: null

Configures Meilisearch to return search results based on a query's meaning and context.

hybrid must be an object. It accepts two fields: embedder and semanticRatio.

embedder must be a string indicating an embedder configured with the /settings endpoint. It is mandatory to specify a valid embedder when performing AI-powered searches.

semanticRatio must be a number between 0.0 and 1.0 indicating the proportion between keyword and semantic search results. 0.0 causes Meilisearch to only return keyword results. 1.0 causes Meilisearch to only return meaning-based results. Defaults to 0.5.

WARNING
Meilisearch will return an error if you use hybrid before activating your instance's vectorStore and configuring an embedder.

Example
cURL
JS
PHP
curl -X POST 'localhost:7700/indexes/INDEX_NAME/search' \
  -H 'content-type: application/json' \
  --data-binary '{
    "q": "kitchen utensils",
    "hybrid": {
      "semanticRatio": 0.9,
      "embedder": "EMBEDDER_NAME"
    }
  }'

Vector (experimental)
Parameter: vector
Expected value: an array of numbers
Default value: null

Use a custom vector to perform a search query. Must be an array of numbers corresponding to the dimensions of the custom vector.

vector is mandatory when performing searches with userProvided embedders. You may also use vector to override an embedder's automatic vector generation.

vector dimensions must match the dimensions of the embedder.

NOTE
If a query does not specify q, but contains both vector and hybrid.semanticRatio bigger than 0, Meilisearch performs a pure semantic search.

If q is missing and semanticRatio is explicitly set to 0, Meilisearch performs a placeholder search without any vector search results.

Example
cURL
curl -X POST 'localhost:7700/indexes/INDEX_NAME/search' \
  -H 'content-type: application/json' \
  --data-binary '{ 
    "vector": [0, 1, 2],
    "embedder": "EMBEDDER_NAME"
  }'

WARNING
Meilisearch will return an error if you use vector before activating your instance's vectorStore and configuring a custom embedder.

Display _vectors in response (experimental)
Parameter: retrieveVectors
Expected value: true or false
Default value: false

Return document embedding data with search results. If true, Meilisearch will display vector data in each document's _vectors field.

Example
cURL
JS
PHP
curl -X POST 'localhost:7700/indexes/INDEX_NAME/search' \
  -H 'content-type: application/json' \
  --data-binary '{
    "q": "kitchen utensils",
    "retrieveVectors": true,
    "hybrid": {
      "embedder": "EMBEDDER_NAME"
    }
  }'

json
{
  "hits": [
    {
      "id": 0,
      "title": "DOCUMENT NAME",
      "_vectors": {
        "default": {
          "embeddings": [0.1, 0.2, 0.3],
          "regenerate": true
        }
      }
      …
    },
    …
  ],
  …
}

Query locales
Parameter: locales
Expected value: array of supported ISO-639 locales
Default value: []

By default, Meilisearch auto-detects the language of a query. Use this parameter to explicitly state the language of a query.

In case of a mismatch between locales and the localized attributes index setting, this parameter takes precedence.

`locales` and `localizedAttributes`
locales and localizedAttributes have the same goal: explicitly state the language used in a search when Meilisearch's language auto-detection is not working as expected.

If you believe Meilisearch is detecting incorrect languages because of the query text, explicitly set the search language with locales.

If you believe Meilisearch is detecting incorrect languages because of document, explicitly set the document language at the index level with localizedAttributes.

For full control over the way Meilisearch detects languages during indexing and at search time, set both locales and localizedAttributes.

Example
cURL
JS
PHP
Java
Go
curl \
-X POST 'http://localhost:7700/indexes/INDEX_NAME/search' \
-H 'Content-Type: application/json' \
--data-binary '{
  "q": "QUERY TEXT IN JAPANESE",
  "locales": ["jpn"]
}'

json
{
  "hits": [
    {
      "id": 0,
      "title": "DOCUMENT NAME",
      "overview_jp": "OVERVIEW TEXT IN JAPANESE"
    }
    …
  ],
  …
}

```