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

s3
  .listBuckets()
  .promise()
  .then(data =>
    data["Buckets"].map(d => d.Name).map(name => ({ Bucket: name }))
  )
  .then(requests =>
    Promise.all(
      requests.map(req =>   
        s3
          .getBucketTagging(req)
          .promise()
          .then(res => Promise.resolve(res.TagSet))
          .then(tags => ({ bucket: req.Bucket, tags: tags}))
          .catch(e => Promise.resolve(({ bucket: req.Bucket, tags: []})))
      )
    )
  )
  .then(items => items.filter(item => {
    if (filter.tagged) {
      return item.tags.map(t => t.Key).includes(filter.tag);
    } else {
      return !item.tags.map(t => t.Key).includes(filter.tag);
    }
  }))
  .then(items => {
    if (details) {
      console.dir(items, { depth: null })
    } else {
      console.dir(items.map(item => item.bucket))
    }
  })
  .catch(e => console.error(e));