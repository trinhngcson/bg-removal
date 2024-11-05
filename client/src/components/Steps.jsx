import { assets } from "../assets/assets";

const Steps = () => {
  return (
    <div className="py-20 xl:py-30 bg-gradient-to-r from-violet-600 to-fuchsia-500 mt-3 lg:mt-5">
      <div className="m-4 lg:mx-60">
        <h1 className="text-center text-2xl md:text-3xl lg:text-4xl mt-4 font-semibold text-white ">
          How to remove the background of a picture.
        </h1>
        <div className="flex items-start flex-wrap grid gap-4 mt-16 xl:mt-16 xl:grid-cols-3 justify-center">
          <div className="flex item-start gap-4 bg-white border drop-shadow-md p-7 pb-10 rounded-lg hover:scale-105 transition-all duration-500">
            <img className="max-w-9" src={assets.upload_icon} alt="" />
            <div>
              <p className="text-xl font-medium">1. Select.</p>
              <p className="text-sm text-neutral-500 mt-1 w-fit">
                For best results, choose an image where the subject has clear
                edges with nothing overlapping.
              </p>
            </div>
          </div>
          <div className="flex item-start gap-4 bg-white border drop-shadow-md p-7 pb-10 rounded-lg hover:scale-105 transition-all duration-500">
            <img className="max-w-9" src={assets.remove_bg_icon} alt="" />
            <div>
              <p className="text-xl font-medium">2. Remove.</p>
              <p className="text-sm text-neutral-500 mt-1 w-fit">
                Upload your image to automatically remove the background in an
                instant.
              </p>
            </div>
          </div>
          <div className="flex item-start gap-4 bg-white border drop-shadow-md p-7 pb-10 rounded-lg hover:scale-105 transition-all duration-500">
            <img className="max-w-9" src={assets.download_icon} alt="" />
            <div>
              <p className="text-xl font-medium">3. Continue editing.</p>
              <p className="text-sm text-neutral-500 mt-1 ">
                Download your new image as a PNG file with a transparent
                background to save, share
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Steps;
