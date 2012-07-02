Gyoji
=====

The administration server of the tuppari system.

Run Test
--------

Before run test, you must set the AWS keys and region to npm config do:

```
npm config set AWS_ACCESS_KEY_ID [YOUR AWS ACCESS KEY ID]
npm config set AWS_SECRET_ACCESS_KEY [YOUR AWS SECRET ACCESS KEY]
npm config set AWS_REGION [YOUR AWS REGION] # This is optional. Default value is 'us-east-1'
```

Then you can run test.

```
make test
```