name: Test Reports API
on:
  workflow_dispatch: # This allows manual triggering
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Test API with JSON payload
        run: |
          curl --request POST \
          --url '${{ secrets.NEXT_PUBLIC_SITE_URL }}/api/send-scheduled-reports' \
          --header 'Content-Type: application/json' \
          --header 'Authorization: ${{ secrets.REPORTS_API_KEY }}' \
          --data '{"frequency": "weekly", "batch": 0, "limit": 1, "test": true}'
      
      - name: Test API with query parameter
        run: |
          curl --request GET \
          --url "${{ secrets.NEXT_PUBLIC_SITE_URL }}/api/send-scheduled-reports?frequency=weekly&batch=0&limit=1&test=true&apiKey=${{ secrets.REPORTS_API_KEY }}"
