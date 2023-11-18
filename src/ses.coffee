import * as SES from "@aws-sdk/client-ses"
import { lift } from "./helpers"

AWS =
  SES: lift SES, region: "us-west-2"

templateExists = (name) -> (await getTemplate name)?

getTemplate = (name) ->
  try
    template = await AWS.SES.getTemplate TemplateName: name
    _: template
  catch error
    if ( error.status == 404 ) || ( error.status == 400 )
      null
    else
      throw error

publishTemplate = ({name, html, subject, text}) ->
  params = 
    Template:
      TemplateName: name
      HtmlPart: html
      SubjectPart: subject
      TextPart: text
  
  if await templateExists name
    await AWS.SES.updateTemplate params
  else
    await AWS.SES.createTemplate params

deleteTemplate = ( name ) ->
  if await templateExists name
    await AWS.SES.deleteTemplate TemplateName: name

sendEmail = ({source, template, toAddresses, templateData}) ->
  jsonTemplateData = JSON.stringify templateData
  params = 
    Source: source
    Destination: ToAddresses: toAddresses
    Template: template
    TemplateData: jsonTemplateData

  await AWS.SES.sendTemplatedEmail params

export { publishTemplate, deleteTemplate, sendEmail }