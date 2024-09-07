# This is the developer repo, not intended to be a public repo
# Call from terminal
## Use GET method for now

## Note
### Need to create .env in root and put OPENAI_API_KEY= inside of it
### Run the following to get a curl command from unescaped url
- `run node dist/url-escape`
https://www.tiktok.com/@joemyheck

### Production
- Depth of 5
- `curl -X GET "https://osintapi-4px4gnxj2q-ue.a.run.app/osintx?username=realdonaldtrump&apikey=noahclark556&query=%7B%22bio%22%3Atrue%2C%22name%22%3Atrue%2C%22following%22%3Atrue%2C%22followers%22%3Atrue%2C%22posts%22%3A5%2C%22aidescription%22%3Atrue%7D"`

- Depth of 10
- `curl -X GET "https://osintapi-4px4gnxj2q-ue.a.run.app/osintx?username=realdonaldtrump&apikey=noahclark556&query=%7B%22bio%22%3Atrue%2C%22name%22%3Atrue%2C%22following%22%3Atrue%2C%22followers%22%3Atrue%2C%22posts%22%3A10%2C%22aidescription%22%3Atrue%7D"`

### Test
## Everything
- `curl -X GET "http://localhost:8080/osintx?username=realdonaldtrump&apikey=noahclark556&query=%7B%22bio%22%3Atrue%2C%22name%22%3Atrue%2C%22following%22%3Atrue%2C%22followers%22%3Atrue%2C%22posts%22%3A5%2C%22aidescription%22%3Atrue%7D"`

- `curl -X GET "http://localhost:8080/osintx?username=elonmusk&apikey=noahclark556&query=%7B%22bio%22%3Atrue%2C%22name%22%3Atrue%2C%22following%22%3Atrue%2C%22followers%22%3Atrue%2C%22posts%22%3A5%2C%22aidescription%22%3Atrue%7D"`

## Everything except for ai
- `curl -X GET "http://localhost:8080/osintx?username=realdonaldtrump&apikey=noahclark556&query=%7B%22bio%22%3Atrue%2C%22name%22%3Atrue%2C%22following%22%3Atrue%2C%22followers%22%3Atrue%2C%22posts%22%3A5%7D"`

## Everything except for post
`curl -X GET "http://localhost:8080/osintx?username=realdonaldtrump&apikey=noahclark556&query=%7B%22bio%22%3Atrue%2C%22name%22%3Atrue%2C%22following%22%3Atrue%2C%22followers%22%3Atrue%2C%22aidescription%22%3Atrue%7D"`


### Authenticate with Google Cloud CLI
1. **Login to CLI:**
    ```bash
    gcloud auth login
    ```

2. **Set the Account:**
    ```bash
    gcloud config set account account@email.com
    ```

3. **Set the Project:**
    ```bash
    gcloud config set project qc-apis
    ```

### Create Required Files
- **Dockerfile**
- **index.js**
- **Run `npm init`** to initialize your project.

## Deployment Instructions

### Build and Submit Docker Image
This step needs to be run every time the code changes:

```bash
gcloud builds submit --tag gcr.io/qc-apis/ttosintapi
```

### Deploy to Cloud Run
```bash
gcloud run deploy ttosintapi --image gcr.io/qc-apis/ttosintapi --platform managed
```
> **Note:** Use number `33` for `us-east1`.

## Useful Commands

### Get the URL of the Deployed Function
```bash
gcloud run services describe ttosintapi --platform managed --format="get(status.url)"
```

### Set the Default Region
```bash
gcloud config set run/region us-east1
```

### Grant Permissions (if Permission Error Occurs)
```bash
gcloud projects add-iam-policy-binding qc-apis --member "DEFAULT_SERVICE_ACCOUNT_HERE" --role "roles/storage.admin"
```

### Run and Test Locally
```bash
PORT=3001 node dist/index
```
or
- ** Port 8080 Default ** 
```bash
node dist/index
```



### Upgrade Memory Limit
```bash
gcloud run services update ttosintapi --memory 4Gi
```