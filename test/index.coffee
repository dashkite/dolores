import { test, success } from "@dashkite/amen"
import print from "@dashkite/amen-console"

import assert from "@dashkite/assert"

import * as Type from "@dashkite/joy/type"
import { generic } from "@dashkite/joy/generic"

import * as ACM from "../src/acm"
import * as DynamoDB from "../src/dynamodb"
import * as VPC from "../src/vpc"

import scenarios from "./scenarios"

import { target } from "./helpers"

do ->

  print await test "Dolores", [

    target "ACM", do ->
      [

        test "getCertificate", ->
          certificate = await ACM.getCertificate "dashkite.io"
          assert certificate?
          assert certificate.arn?
          assert certificate._?
          assert.equal "dashkite.io", certificate._.DomainName
      ]

    target "DynamoDB", do -> 
      [
      
        test "wrap/unwrap", do ->
          for name, value of scenarios.DynamoDB.wrap
            test name, ->
              assert.deepEqual value, 
                DynamoDB.unwrap DynamoDB.wrap value

      ]

    target "VPC", do ->

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

  ]