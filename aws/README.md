# Amazon Cloudformation Template for Tuppari

## How to create statck on AWS environment

* Login to AWS Management Console.
* Select "CloudFormation" from services menu.
* First, create CloudFormation stack using `cf-tuppari-dynamo.json` template.
 This template creates [Amazon DynamoDB](http://aws.amazon.com/en/dynamodb/) tables for Tuppari.
 When above process completed, check "Outputs" tab. You can see actual table names for tuppari like below. Make a note value of "AccountTableName", "ApplicationTableName", "KeypairTableName".

<table>
<tr>
  <th>Key</th><th>Description</th><th>Value</th>
</tr>
<tr>
  <td>AccountTableName</td><td>Dynamo table name of the account</td><td>TuppariDB-Account-XXXXLUI0BRD1</td>
</tr>
<tr>
  <td>ApplicationTableName</td><td>Dynamo table name of the application</td><td>TuppariDB-Application-XXXX4GP7ZE1G</td>
</tr>
<tr>
  <td>KeypairTableName</td><td>Dynamo table name of the keypair</td><td>TuppariDB-Keypair-XXXXQEG0Q6WD</td>
</tr>
</table>

* Second, create CloudFormation stack using 'cf-tuppari.json' template.
 This template creates Gyoji, Harite, and Redis servers with autoscaling capability.
 To create a stack, you must set some parameters below.

<table>
<tr>
  <th>Name</th><th>Description</th>
</tr>
<tr>
  <td>AccountTable</td><td>Dynamo table name of the account create above process</td>
</tr>
<tr>
  <td>ApplicationTable</td><td>Dynamo table name of the application create above process</td>
</tr>
<tr>
  <td>KeypairTable</td><td>Dynamo table name of the keypair create above process</td>
</tr>
<tr>
  <td>KeyName</td><td>Name of an existing EC2 KeyPair to enable SSH access to the application server</td>
</tr>
</table>

* You can also change the properties below if you want.
    * RootDeviceType
    * GyojiServerInstanceType
    * GyojiServerPort
    * HariteServerInstanceType
    * HariteServerPort
    * RedisServerInstanceType
    * RedisServerPort