# To Set up a local DICOM server

# Running Orthanc

# Runs orthanc so long as window remains open
yarn run orthanc:up

                                                                                                              Upload your first Study:

                                                                                                              Navigate to Orthanc's web interface at http://localhost:8042/app/explorer.html in a web browser.
                                                                                                              In the top right corner, click "Upload"
                                                                                                              Click "Select files to upload..." and select one or more DICOM files
                                                                                                              Click "Start the upload"


# If you haven't already, enable yarn workspaces
yarn config set workspaces-experimental true

# Restore dependencies
yarn install

# Run our dev command, but with the local orthanc config
yarn run dev:orthanc
