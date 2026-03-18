import Image from "next/image";

import folderBackSvg from "@/assets/components/folder/back-folder.svg";
import paperSvg from "@/assets/components/folder/paper.svg";
import folderFrontSvg from "@/assets/components/folder/front-folder.svg";
import blackFolderBackSvg from "@/assets/components/folder/black-back-folder.svg";
import blackFolderFrontSvg from "@/assets/components/folder/black-front-folder.svg";

interface AnimatedFolderProps {
  state: number;
  isActive?: boolean;
}

export function AnimatedFolder({ state, isActive }: AnimatedFolderProps) {
  const paperConfigs = [
    {
      id: 1,
      activeClass:
        "opacity-100 translate-y-[-8px] -translate-x-[6px] -rotate-[9deg]",
      hiddenClass: "opacity-0 translate-y-[20px] rotate-0",
      delay: "delay-0",
      zClass: "z-[12]",
    },
    {
      id: 2,
      activeClass:
        "opacity-100 translate-y-[-12px] translate-x-[8px] -rotate-[1deg]",
      hiddenClass: "opacity-0 translate-y-[20px] rotate-0",
      delay: "delay-75",
      zClass: "z-[11]",
    },
    {
      id: 3,
      activeClass:
        "opacity-100 translate-y-[-15px] translate-x-[10px] rotate-[20deg]",
      hiddenClass: "opacity-0 translate-y-[20px] rotate-0",
      delay: "delay-150",
      zClass: "z-10",
    },
  ];

  return (
    <div className="relative h-24 w-24 overflow-visible">
      <Image
        src={isActive ? folderBackSvg : blackFolderBackSvg}
        alt="folder back"
        width={67}
        height={42}
        unoptimized
        className="absolute bottom-2 left-1/2 z-0 w-[94%] max-w-none -translate-x-1/2"
      />

      <div className="absolute inset-x-0 bottom-4 z-10 flex items-end justify-center">
        {paperConfigs.map((config, index) => {
          const isVisible = state >= index + 1;

          return (
            <Image
              key={config.id}
              src={paperSvg}
              alt={`paper ${config.id}`}
              width={45}
              height={53}
              unoptimized
              className={`absolute h-14 w-auto origin-bottom-left transition-all duration-500 ease-out ${config.delay} ${config.zClass} ${
                isVisible ? config.activeClass : config.hiddenClass
              }`}
            />
          );
        })}
      </div>

      <Image
        src={isActive ? folderFrontSvg : blackFolderFrontSvg}
        alt="folder front"
        width={67}
        height={42}
        unoptimized
        className={`absolute bottom-0 left-1/2 z-20 w-[108%] max-w-none -translate-x-1/2`}
      />
    </div>
  );
}
