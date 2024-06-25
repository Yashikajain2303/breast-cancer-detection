import requests
import json

url = "http://localhost:8000/convert"

payload = json.dumps({
  "displaySets": [
    {
      "displaySetInstanceUID": "4654f270-016a-4a68-70c6-0ef0e277a629",
      "description": "R CC",
      "seriesNumber": 71300000,
      "modality": "MG",
      "seriesDate": "22-Mar-2016",
      "numInstances": 1,
      "messages": {
        "messages": []
      },
      "StudyInstanceUID": "1.3.12.2.1107.5.8.3.788780.868487.80674849.2016032206524560",
      "componentType": "thumbnailTracked",
      "dragData": {
        "type": "displayset",
        "displaySetInstanceUID": "4654f270-016a-4a68-70c6-0ef0e277a629"
      },
      "isTracked": False
    },
    {
      "displaySetInstanceUID": "54142b0b-8346-e12e-9c0a-09709a49af63",
      "description": "L CC",
      "seriesNumber": 71300000,
      "modality": "MG",
      "seriesDate": "22-Mar-2016",
      "numInstances": 1,
      "messages": {
        "messages": []
      },
      "StudyInstanceUID": "1.3.12.2.1107.5.8.3.788780.868487.80674849.2016032206524560",
      "componentType": "thumbnailTracked",
      "dragData": {
        "type": "displayset",
        "displaySetInstanceUID": "54142b0b-8346-e12e-9c0a-09709a49af63"
      },
      "isTracked": False
    },
    {
      "displaySetInstanceUID": "1154fd70-56a4-acbc-f679-25c9c734db1f",
      "description": "R MLO",
      "seriesNumber": 71100000,
      "modality": "MG",
      "seriesDate": "22-Mar-2016",
      "numInstances": 1,
      "messages": {
        "messages": []
      },
      "StudyInstanceUID": "1.3.12.2.1107.5.8.3.788780.868487.80674849.2016032206524560",
      "componentType": "thumbnailTracked",
      "dragData": {
        "type": "displayset",
        "displaySetInstanceUID": "1154fd70-56a4-acbc-f679-25c9c734db1f"
      },
      "isTracked": False
    },
    {
      "displaySetInstanceUID": "cd8c25c6-2d00-e322-3615-aa197b3b5316",
      "description": "L MLO",
      "seriesNumber": 71300000,
      "modality": "MG",
      "seriesDate": "22-Mar-2016",
      "numInstances": 1,
      "messages": {
        "messages": []
      },
      "StudyInstanceUID": "1.3.12.2.1107.5.8.3.788780.868487.80674849.2016032206524560",
      "componentType": "thumbnailTracked",
      "dragData": {
        "type": "displayset",
        "displaySetInstanceUID": "cd8c25c6-2d00-e322-3615-aa197b3b5316"
      },
      "isTracked": False
    }
  ],
  "studies": [
    {
      "studyInstanceUid": "1.3.12.2.1107.5.8.3.788780.868487.80674849.2016032206524560",
      "date": "22-Mar-2016",
      "description": "DIAGNOSTIC COMBO",
      "modalities": "MG",
      "numInstances": 4,
      "displaySets": [
        {
          "displaySetInstanceUID": "4654f270-016a-4a68-70c6-0ef0e277a629",
          "description": "R CC",
          "seriesNumber": 71300000,
          "modality": "MG",
          "seriesDate": "22-Mar-2016",
          "numInstances": 1,
          "messages": {
            "messages": []
          },
          "StudyInstanceUID": "1.3.12.2.1107.5.8.3.788780.868487.80674849.2016032206524560",
          "componentType": "thumbnailTracked",
          "dragData": {
            "type": "displayset",
            "displaySetInstanceUID": "4654f270-016a-4a68-70c6-0ef0e277a629"
          },
          "isTracked": False
        },
        {
          "displaySetInstanceUID": "54142b0b-8346-e12e-9c0a-09709a49af63",
          "description": "L CC",
          "seriesNumber": 71300000,
          "modality": "MG",
          "seriesDate": "22-Mar-2016",
          "numInstances": 1,
          "messages": {
            "messages": []
          },
          "StudyInstanceUID": "1.3.12.2.1107.5.8.3.788780.868487.80674849.2016032206524560",
          "componentType": "thumbnailTracked",
          "dragData": {
            "type": "displayset",
            "displaySetInstanceUID": "54142b0b-8346-e12e-9c0a-09709a49af63"
          },
          "isTracked": False
        },
        {
          "displaySetInstanceUID": "1154fd70-56a4-acbc-f679-25c9c734db1f",
          "description": "R MLO",
          "seriesNumber": 71100000,
          "modality": "MG",
          "seriesDate": "22-Mar-2016",
          "numInstances": 1,
          "messages": {
            "messages": []
          },
          "StudyInstanceUID": "1.3.12.2.1107.5.8.3.788780.868487.80674849.2016032206524560",
          "componentType": "thumbnailTracked",
          "dragData": {
            "type": "displayset",
            "displaySetInstanceUID": "1154fd70-56a4-acbc-f679-25c9c734db1f"
          },
          "isTracked": False
        },
        {
          "displaySetInstanceUID": "cd8c25c6-2d00-e322-3615-aa197b3b5316",
          "description": "L MLO",
          "seriesNumber": 71300000,
          "modality": "MG",
          "seriesDate": "22-Mar-2016",
          "numInstances": 1,
          "messages": {
            "messages": []
          },
          "StudyInstanceUID": "1.3.12.2.1107.5.8.3.788780.868487.80674849.2016032206524560",
          "componentType": "thumbnailTracked",
          "dragData": {
            "type": "displayset",
            "displaySetInstanceUID": "cd8c25c6-2d00-e322-3615-aa197b3b5316"
          },
          "isTracked": False
        }
      ]
    }
  ]
})
headers = {
  'Accept-Language': 'en-US,en;q=0.9',
  'Connection': 'keep-alive',
  'Content-Type': 'application/json',
  'Origin': 'http://localhost:3000',
  'Referer': 'http://localhost:3000/',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)
