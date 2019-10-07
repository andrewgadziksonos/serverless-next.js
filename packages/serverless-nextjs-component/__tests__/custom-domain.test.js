const execa = require("execa");
const fse = require("fs-extra");
const { mockDomain } = require("@serverless/domain");
const { mockS3 } = require("@serverless/aws-s3");
const { mockLambda, mockLambdaPublish } = require("@serverless/aws-lambda");
const { mockCloudFront } = require("@serverless/aws-cloudfront");
const NextjsComponent = require("../serverless");

jest.mock("execa");
jest.mock("fs-extra");

describe("Custom domain", () => {
  let componentOutputs;

  beforeEach(async () => {
    execa.mockResolvedValueOnce();
    fse.readJSON.mockResolvedValue({});

    mockS3.mockResolvedValue({
      name: "bucket-xyz"
    });
    mockLambda.mockResolvedValue({
      arn: "arn:aws:lambda:us-east-1:123456789012:function:my-func"
    });
    mockLambdaPublish.mockResolvedValue({
      version: "v1"
    });
    mockCloudFront.mockResolvedValueOnce({
      url: "https://cloudfrontdistrib.amazonaws.com"
    });
    mockDomain.mockResolvedValueOnce({
      domains: ["https://www.example.com"]
    });

    const component = new NextjsComponent();
    componentOutputs = await component.default({
      domain: ["www", "example.com"]
    });
  });

  it("uses @serverless/domain to provision custom domain", async () => {
    expect(mockDomain).toBeCalledWith({
      privateZone: false,
      domain: "example.com",
      subdomains: {
        www: {
          url: "https://cloudfrontdistrib.amazonaws.com"
        }
      }
    });
  });

  it("uses outputs custom domain url", async () => {
    expect(componentOutputs.appUrl).toEqual("https://www.example.com");
  });
});
