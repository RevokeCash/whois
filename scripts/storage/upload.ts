import { S3Client } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import path from 'path';
import { parsePath, readData, uploadData } from 'scripts/utils';
import { DATA_BASE_PATH } from 'scripts/utils/constants';
import { AddressType } from 'scripts/utils/types';
import walkdir from 'walkdir';
import PQueue from 'p-queue';

config();

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: false,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET
  }
});

const pQueue = new PQueue({ concurrency: 10_000 });

export const uploadGeneratedData = async (addressType: AddressType) => {
  const paths = await walkdir.async(path.join(DATA_BASE_PATH, 'generated', addressType));
  const dataPaths = paths.filter((path) => path.endsWith('.json'));

  await Promise.all(
    dataPaths.map(
      async (dataPath) =>
      pQueue.add(
        async () => {
        const { addressType, chainId, address } = parsePath(dataPath);
        const data = await readData('generated', addressType, chainId, address);
        await uploadData(s3Client, process.env.S3_BUCKET, 'generated', addressType, chainId, address, data);
      })
    )
  );

  console.log('Finished uploading', addressType);
};

uploadGeneratedData('tokens');
uploadGeneratedData('spenders');
