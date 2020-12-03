# Description

A simple Express.js server showcasing the usage of [GridFS](https://docs.mongodb.com/manual/core/gridfs/), the current MongoDB (ver. 3.x) specification for storing and retrieving larger files.

# GridFS

GridFS allows developers to store files in MongoDB that exceed the 16 MB limit of BSON documents by dividing them into multiple chunks. You can read more about them [here](https://docs.mongodb.com/manual/core/gridfs/).

# Credit

This project is based on [Brad Traversy](https://github.com/bradtraversy)'s [mongo_file_uploads](https://github.com/bradtraversy/mongo_file_uploads) repository, but here we use MongoDBs native functions instead of third party packages for streaming files to and from the database. This project also utilizes the newer GridFSBucket API, instead of the now depricated GridStore used in the aforementioned third party packages.
