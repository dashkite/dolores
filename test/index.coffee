import { test, success } from "@dashkite/amen"
import print from "@dashkite/amen-console"

import assert from "@dashkite/assert"

import * as Type from "@dashkite/joy/type"
import * as Time from "@dashkite/joy/time"
import { generic } from "@dashkite/joy/generic"

import * as ACM from "../src/acm"
import * as DynamoDB from "../src/dynamodb"
import * as VPC from "../src/vpc"
import * as SQS from "../src/sqs"
import * as SNS from "../src/sns"

import scenarios from "./scenarios"

import { target } from "./helpers"

do ->

  print await test "Dolores", [

    target "ACM", ->
      [

        test "getCertificate", ->
          certificate = await ACM.getCertificate "dashkite.io"
          assert certificate?
          assert certificate.arn?
          assert certificate._?
          assert.equal "dashkite.io", certificate._.DomainName
      ]

    target "DynamoDB", -> 
      [
      
        test "wrap/unwrap", do ->
          for name, value of scenarios.DynamoDB.wrap
            test name, ->
              assert.deepEqual value, 
                DynamoDB.unwrap DynamoDB.wrap value

      ]

    target "VPC", ->

      [

        test "get", ->
          vpc = await VPC.get()
          assert vpc.id?
          assert.equal "default", vpc.name

        test "Subnets", [      

          test "list", ->
            subnets = await VPC.Subnets.list()
            assert subnets?
            assert subnets.length?
            for subnet in subnets
              assert subnet.id?
              assert subnet.zone?
              assert subnet.arn?

        ]

        test "SecurityGroups", [      

          test "list", ->
            groups = await VPC.SecurityGroups.list()
            assert groups?
            assert groups.length?
            for group in groups
              assert group.id?
              assert group.description?
              assert group.vpc?

        ]

      ]

    target "SQS", ({ queue, message } = {}) ->

        [

          await test "create", ->
            queue = await SQS.create "test-queue-sqs"
            assert queue.url?

          await test "send", ->
            do ({ message } = {}) ->
              message = await SQS.send queue, "hello, world"
              assert message.id?

          await test "receive", ->
            do ({ messages } = {}) ->
              [ message ] = await SQS.receive queue
              assert.equal "hello, world", message.content
        ]      

    target "SNS", ({ topic, queue, subscription } = {}) ->
      
      [

        await test "create", ->
          topic = await SNS.create "test-topic-sns"
          assert topic.arn?

        await test "subscribe", ->
          queue = await SQS.create "test-queue-sns"
          # queue =
          #   arn: "arn:aws:sqs:us-east-1:618441030511:test-queue-sns" 
          #   url: "https://sqs.us-east-1.amazonaws.com/618441030511/test-queue-sns"
          #
          # From AWS SDK docs:
          # https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-sqs/Class/CreateQueueCommand/
          #
          # After you create a queue, you must wait at least one second after
          # the queue is created to be able to use the queue.
          #
          await Time.sleep 1000

          subscription = await SNS.subscribe topic, queue
          assert subscription.arn?

        await test "publish", ->
          do ({ message } = {}) ->
            message = await SNS.publish topic, "hello, world"
            assert message.id?
            [ message ] = await SQS.receive queue
            assert message?
            assert.equal "hello, world", message.content
      ]   
  ]