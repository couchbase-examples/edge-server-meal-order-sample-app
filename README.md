## Introduction

The sample React-based web application simulates an airline seat back application, that allows users in business and economy class to place their in-flight meal orders. The sample app leverages **Couchbase Edge Server** for data storage and processing at the edge, simulating a disconnected offline experience within an aircraft. The seatback web app accesses Edge Server via RESTful interface. When there is Internet connectivity, the **Edge Sever syncs data with remote Capella App Services**.


## Setup & Technology Stack

The setup would be as follows
![](https://www.couchbase.com/blog/wp-content/uploads/sites/1/2025/02/edge-sample-app-setup-e1740436672145.png)

* Capella / Capella App Services
* Couchbase Edge Server
* Sample web application


## Installation Instructions
### Capella Cluster Setup
Although instructions are specified for Capella, equivalent instructions apply to self managed couchbase server as well. 

* Sign up for Capella Free Tier and [follow the steps](https://docs.couchbase.com/cloud/get-started/create-account.html) to deploy a free tier cluster. 
*  Follow [bucket creation instructions](https://docs.couchbase.com/cloud/clusters/data-service/manage-buckets.html#add-bucket) to create a *bucket* named "mealordering" 
*  Follow [scope creation instructions](https://docs.couchbase.com/cloud/clusters/data-service/about-buckets-scopes-collections.html#scopes) to create a *scope* named "AmericanAirlines" and follow the [collectin creation instructions](https://docs.couchbase.com/cloud/clusters/data-service/about-buckets-scopes-collections.html#collections) to create a *collection* named "AA234"

   ![](https://www.couchbase.com/blog/wp-content/uploads/sites/1/2025/02/edge-sample-create-doc-e1740526024180.png)
*  Download **"mealordering.zip"** sample data set from [this location](https://edge-server-tutorial-data.s3.us-east-2.amazonaws.com/mealordering.zip). It includes 4 documents
    - businessinventory.json
    - businessmeal.json
    - economyinventory.json
    - economymeal.json

*  Follow [instructions](https://docs.couchbase.com/cloud/clusters/data-service/manage-documents.html#create-documents) to create sample documents corresponding to each of the documents above. Add it to to specified bucket named "mealordering", scope nameed "AmericanAirlines" and collection named "AA234" created in previous step. So for example, create a document with docIs of "businessinventory" and copy contents of it.

![](https://www.couchbase.com/blog/wp-content/uploads/sites/1/2025/02/Screenshot-2025-02-25-at-6.44.52-PM-e1740527146821.png)

At the end of the setup, your Capella Setup looks like this :-
![](https://www.couchbase.com/blog/wp-content/uploads/sites/1/2025/02/edge-sample-cluster-e1740446463671.png)

### Capella App Services
Although instructions are specified for Capella App Services, equivalent instructions apply to self managed sync gateway as well. 

*  Follow [instructions](https://docs.couchbase.com/cloud/get-started/create-account.html#app-services) to create a free tier App Services that links to the free tier cluster that was created in previous step
*  Create an *App Endpoint* named "american234" by following these [instructioncs](https://docs.couchbase.com/cloud/get-started/configuring-app-services.html#create-app-endpoint). When you create App Endpoint, link it to bucket named "mealordering", the scope named "AmericanAirlines" and collection named "AA234"

   The configuration should looking something like this
   ![](https://www.couchbase.com/blog/wp-content/uploads/sites/1/2025/02/edge-sample-appendpoint-e1740446441680.png)

*  Create an App User named "edgeserver234".  Remember what password you use as you will need to configure your Edge Server later. 
      - Set up the access grant so the App User is grantsed access to the  channelnamed "AA234" in corresponding collection.

   The configuration of App User should look something like this
   ![](https://www.couchbase.com/blog/wp-content/uploads/sites/1/2025/02/edge-sample-app-user-e1740441491684.png)

*  Go to the "connect" tab and record the public URL endpoint. You will need it when you configure your Edge Server
![](https://www.couchbase.com/blog/wp-content/uploads/sites/1/2025/02/edge-sample-connect-1-e1740441640142.png)


### Couchbase Edge Server Setup
The instructions below describe how to deploy and run edge server on your local Mac machine. The equivalent instructions should apply to Linux based machine as well.

* Download Edge Server binary from ![](https://www.couchbase.com/downloads?family=edge-server)
* Download Edge Server configuration zip file named **"config-edge-server.zip"** from this [location](https://edge-server-tutorial-data.s3.us-east-2.amazonaws.com/config-edge-server.zip)
* Unzip the contents of the package. It should include the following
      - **usersfile**: This includes the list of web users who can access data from Edge Server. This is the credentials with which the web app authenticates itself
      - **certfile.pem** and **keyfile**: The edge server is configured to startup with anonymous self signed certificate with a "common name" of localhost. This is the cert file and private key corresponding to that. We'd recommend you follow the Edge Server documentation to generate own certificate and private key.
* Open the the config file named "config-tls-replication-sync.json" and edit file as follows -
      -   in the Replication section, replace these placeholders 
         ```bash
         "replications":[
            {
               // setup a bidirectional continous replication
	            "source":"<<REPLACE WITH THE PUBLIC URL FROM CONNECT PAGE>>",
               "target":"american234",
               "bidirectional": true,
               "continuous":true,
               "collections":{"AmericanAirlines.AA234":{}},
                "auth":{
                  "user":"edgeserver234", // user setup on remote app services/Sync Gateway
                  "password":"<<REPLACE WITH PASSWORD OF APP USER>>" // user setup on remote app services/Sync Gateway
               }
            }
         ]
         ```

         - The source should correspond to the public URL that you get from the Connect tab of App Endpoint
         - The password should be the password corresponding to the App User that you created on App Endpoint

* Start the edge server. It was start listening for incoming connections on port 60000 (you can change that in yout config file)

      ```bash
         ./couchbase-edge-server  --verbose  config-tls-replication-sync.json
      ```

      If everything is setup properly, the Edge Server wull sync down documents from remote App Services

### Web App Setup 

Follow these steps to set up and run the application locally on the same machine as the Edge Server:

* **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd edge-server-sko-demo
   ```

* **Install Dependencies**:
   Ensure you have **Node.js** (version 16 or later) installed. Then, install the required dependencies by running:
   ```bash
   npm install
   ```

* **Create .env File**:
   Create a .env file in the project root and define the URL to Edge Server:
   ```bash
   EDGE_SERVER_BASE_URL="https://localhost:60000"
   ```

* **Start the Development Server**:
   Launch the application in development mode using:
   ```bash
   npm run dev -- --host
   ```
   The application will be available at `http://localhost:5173` (or at an IP Address that can be accessible over local network)


## Run the demo
* Open the web app in a browser. It can be on local machine or remote. 
   - `http://localhost:5173` will open up the business version of app
   - `http://localhost:5173/economy` will open up the economy version of app

* Disconnect the local machine from the Internet so it cannot access the remote App Services. In this scenaario, the Edge Server and the web app are disconnected from Internet
![](https://www.couchbase.com/blog/wp-content/uploads/sites/1/2025/02/edge-sample-app-business-e1740445568731.png)

* Place some orders via the app. 
![](https://www.couchbase.com/blog/wp-content/uploads/sites/1/2025/02/edge-sample-app-place-order-e1740445890243.png)


You will see corresponding requests show up in the console output of the Edge Server, similar to ones below
```bash
2025-02-24T20:04:08.756-0500	127.0.0.1:61556 PUT /american234.AmericanAirlines.AA234/economyinventory?rev=5-3ad339cd20ca9f04874bf62e45c95eac8bcc0689 -> 201 Created  [282.551ms]
2025-02-24T20:04:08.756-0500	(Listener) Obj=/RESTConnection#107/ End of socket connection from 127.0.0.1:61556 (Connection:close) 
2025-02-24T20:04:08.769-0500	(Listener) Incoming TLS connection from 127.0.0.1:61558 -- starting handshake
2025-02-24T20:04:08.799-0500	(Listener) Accepted connection from 127.0.0.1:61558
2025-02-24T20:04:08.800-0500	(Listener) {RESTConnection#108}==> litecore::edge_server::RESTConnection from 127.0.0.1:61558 @0x600003d08650
2025-02-24T20:04:08.800-0500	(Listener) Obj=/RESTConnection#108/ Handling GET /american234.AmericanAirlines.AA234/economyinventory 
2025-02-24T20:04:09.078-0500	127.0.0.1:61558 GET /american234.AmericanAirlines.AA234/economyinventory -> 200   [278.044ms]
2025-02-24T20:04:09.078-0500	(Listener) Obj=/RESTConnection#108/ End of socket connection from 127.0.0.1:61558 (Connectio

```
* You can also use any HTTP client to fetch a document and verify that its updated

``` bash
curl --location 'https://localhost:60000/american234.AmericanAirlines.AA234/businessinventory' \
--header 'Authorization: Basic c2VhdHVzZXI6cGFzc3dvcmQ='
```

## Reference Documentation
- [Couchbase Edge Server](https://docs.couchbase.com/couchbase-edge-server/current/get-started/get-started-landing.html)
- [Capella](https://docs.couchbase.com/cloud/get-started/intro.html)