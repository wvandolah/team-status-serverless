```
resources:
  Resources:
    sendNotificationTopic:
      Type: AWS::SNS::Topic
      Properties:
        TopicName: ${self:custom.topics.sendNotificationTopic}

    gameDbQueue:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: ${self:custom.queues.gameDbQueue}

    gameSendNotificationQueue:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: ${self:custom.queues.gameSendNotificationQueue}
      
    snsGameDbQueueSqsPolicy:
      Type: AWS::SQS::QueuePolicy
      Properties:
        PolicyDocument:
          Version: "2012-10-17"
          Statement:
            - Sid: "allow-sns-messages"
              Effect: Allow
              Principal: "*"
              Resource: !GetAtt
                - gameDbQueue
                - Arn
              Action: "SQS:SendMessage"
              Condition:
                ArnEquals:
                  "aws:SourceArn": !Ref sendNotificationTopic
        Queues:
          - Ref: gameDbQueue
    
    snsGameSendNotificationQueueSqsPolicy:
      Type: AWS::SQS::QueuePolicy
      Properties:
        PolicyDocument:
          Version: "2012-10-17"
          Statement:
            - Sid: "allow-sns-messages"
              Effect: Allow
              Principal: "*"
              Resource: !GetAtt
                - gameSendNotificationQueue
                - Arn
              Action: "SQS:SendMessage"
              Condition:
                ArnEquals:
                  "aws:SourceArn": !Ref sendNotificationTopic
        Queues:
          - Ref: gameSendNotificationQueue

    gameDbQueueSubscription:
      Type: 'AWS::SNS::Subscription'
      Properties:
        TopicArn: !Ref sendNotificationTopic
        Endpoint: !GetAtt
          - gameDbQueue
          - Arn
        Protocol: sqs
        RawMessageDelivery: 'true'

    gameSendNotificationQueueSubscription:
      Type: 'AWS::SNS::Subscription'
      Properties:
        TopicArn: !Ref sendNotificationTopic
        Endpoint: !GetAtt
          - gameSendNotificationQueue
          - Arn
        Protocol: sqs
        RawMessageDelivery: 'true'
```