# Amazon Cloudformation Template for Tuppari

## How to create statck on AWS environment

Create stack with [AWS CloudFormation Command Line Tools](http://aws.amazon.com/developertools/2555753788650372),
use [cfn-create-stack](http://docs.amazonwebservices.com/AWSCloudFormation/latest/UserGuide/create-stack.html) command do:

    $ cfn-create-stack [YOUR_STACK_NAME] \
        --template-file ./cf-harite-test.json \
        --region ap-northeast-1 \
        --capabilities CAPABILITY_IAM \
        --parameters "KeyName=[YOUR_EC2_KEYPAIR_NAME];AppRepoURL=git://github.com/hakobera/tuppari-servers.git"