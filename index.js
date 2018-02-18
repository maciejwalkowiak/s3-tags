#!/usr/bin/env node

const minimist = require('minimist');
const AWS = require("aws-sdk");
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const argv = minimist(process.argv.slice(2));
const filter = {
  tag: argv['tag'],
  tagged: argv['not-tagged'] === undefined
};

const details = argv['details'] !== undefined;

class Bucket {
  constructor(name, tags) {
    this.name = name;
    this.tags = tags;
  }

  tagNames() {
    return this.tags.map(t => t.Key);
  }

  hasTag(tag) {
    return this.tagNames().includes(tag);
  }
}

s3
  .listBuckets()
  .promise()
  .then(data => data["Buckets"].map(bucket => ({ Bucket: bucket.Name })))
  .then(requests =>
    Promise.all(
      requests.map(req =>   
        s3
          .getBucketTagging(req)
          .promise()
          .then(res => Promise.resolve(res.TagSet))
          .then(tags => new Bucket(req.Bucket, tags))
          .catch(e => Promise.resolve(new Bucket(req.Bucket, [])))
      )
    )
  )
  .then(items => items.filter(item => {
    if (filter.tagged) {
      return item.hasTag(filter.tag);
    } else {
      return !item.hasTag(filter.tag);
    }
  }))
  .then(items => {
    if (details) {
      console.dir(items, { depth: null })
    } else {
      console.dir(items.map(item => item.name))
    }
  })
  .catch(e => console.error(e));