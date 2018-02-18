# S3 Tags

Simple utility to find tagged and untagged S3 buckets.

## Usage

List all buckets tagged with `aws:cloudformation:stack-name`:

```
$ s3tags --tag=aws:cloudformation:stack-name 
```

List all buckets and their tags tagged with `aws:cloudformation:stack-name`:

```
$ s3tags --tag=aws:cloudformation:stack-name --details 
```

List all buckets not tagged with `aws:cloudformation:stack-name`:

```
$ s3tags --tag=aws:cloudformation:stack-name --not-tagged
```