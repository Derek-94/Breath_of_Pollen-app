const { withDangerousMod, withInfoPlist } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

const LOCALIZED_NAMES = {
  ja: '花粉の呼吸',
  ko: '꽃가루의 호흡',
  en: 'Pollen Breathing',
}

const LOCALIZED_LOCATION_PERMISSION = {
  ja: '現在地の天気・花粉情報を取得するために位置情報を使用します。',
  ko: '현재 위치의 날씨 및 꽃가루 정보를 가져오기 위해 위치 정보를 사용합니다.',
  en: 'Used to get weather and pollen information for your current location.',
}

const LOCALIZED_NOTIFICATION_PERMISSION = {
  ja: '明日の花粉・天気情報を夕方にお知らせします。',
  ko: '내일 꽃가루·날씨 정보를 저녁에 알려드립니다.',
  en: "We'll notify you about tomorrow's pollen and weather each evening.",
}

const genUUID = () => {
  const hex = '0123456789ABCDEF'
  let id = ''
  for (let i = 0; i < 24; i++) id += hex[Math.floor(Math.random() * 16)]
  return id
}

// iOS: InfoPlist.strings 생성 + project.pbxproj에 직접 텍스트로 등록
const withIosLocalizedAppName = (config) => {
  // 1. Info.plist에 CFBundleLocalizations 추가
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.CFBundleLocalizations = Object.keys(LOCALIZED_NAMES)
    return cfg
  })

  // 2. lproj 파일 생성 + pbxproj 직접 편집 (xcode API 대신 텍스트 조작)
  config = withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const iosDir = cfg.modRequest.platformProjectRoot
      const projectName = cfg.modRequest.projectName
      const langs = Object.keys(LOCALIZED_NAMES)

      // lproj 파일 생성
      for (const [lang, name] of Object.entries(LOCALIZED_NAMES)) {
        const lprojDir = path.join(iosDir, `${lang}.lproj`)
        if (!fs.existsSync(lprojDir)) fs.mkdirSync(lprojDir, { recursive: true })
        const locationPermission = LOCALIZED_LOCATION_PERMISSION[lang]
        const notifPermission = LOCALIZED_NOTIFICATION_PERMISSION[lang]
        fs.writeFileSync(
          path.join(lprojDir, 'InfoPlist.strings'),
          `CFBundleDisplayName = "${name}";\nNSLocationWhenInUseUsageDescription = "${locationPermission}";\nNSUserNotificationUsageDescription = "${notifPermission}";\n`,
          'utf8'
        )
      }

      // project.pbxproj 편집
      const pbxprojPath = path.join(iosDir, `${projectName}.xcodeproj`, 'project.pbxproj')
      let proj = fs.readFileSync(pbxprojPath, 'utf8')

      // 이미 추가됐으면 스킵
      if (proj.includes('InfoPlist.strings')) return cfg

      const fileRefUUIDs = Object.fromEntries(langs.map((l) => [l, genUUID()]))
      const variantUUID = genUUID()
      const buildFileUUID = genUUID()

      // (a) PBXFileReference 추가
      const fileRefs = langs
        .map(
          (lang) =>
            `\t\t${fileRefUUIDs[lang]} /* ${lang} */ = {isa = PBXFileReference; lastKnownFileType = text.plist.strings; name = ${lang}; path = ${lang}.lproj/InfoPlist.strings; sourceTree = "<group>"; };`
        )
        .join('\n')
      proj = proj.replace('/* End PBXFileReference section */', `${fileRefs}\n/* End PBXFileReference section */`)

      // (b) PBXBuildFile 추가
      const buildFileLine = `\t\t${buildFileUUID} /* InfoPlist.strings in Resources */ = {isa = PBXBuildFile; fileRef = ${variantUUID} /* InfoPlist.strings */; };`
      proj = proj.replace('/* End PBXBuildFile section */', `${buildFileLine}\n/* End PBXBuildFile section */`)

      // (c) PBXVariantGroup 추가
      const variantBlock = [
        `\t\t${variantUUID} /* InfoPlist.strings */ = {`,
        `\t\t\tisa = PBXVariantGroup;`,
        `\t\t\tchildren = (`,
        ...langs.map((lang) => `\t\t\t\t${fileRefUUIDs[lang]} /* ${lang} */,`),
        `\t\t\t);`,
        `\t\t\tname = InfoPlist.strings;`,
        `\t\t\tsourceTree = "<group>";`,
        `\t\t};`,
      ].join('\n')

      if (proj.includes('/* Begin PBXVariantGroup section */')) {
        proj = proj.replace('/* End PBXVariantGroup section */', `${variantBlock}\n/* End PBXVariantGroup section */`)
      } else {
        proj = proj.replace(
          '/* End PBXSourcesBuildPhase section */',
          `/* End PBXSourcesBuildPhase section */\n\n/* Begin PBXVariantGroup section */\n${variantBlock}\n/* End PBXVariantGroup section */`
        )
      }

      // (d) PBXResourcesBuildPhase files 에 추가
      proj = proj.replace(
        /(isa = PBXResourcesBuildPhase;[\s\S]*?files = \()/,
        `$1\n\t\t\t\t${buildFileUUID} /* InfoPlist.strings in Resources */,`
      )

      // (e) mainGroup children 에 variantGroup 추가
      const mainGroupMatch = proj.match(/mainGroup = ([0-9A-F]{24})/)
      if (mainGroupMatch) {
        const mgUUID = mainGroupMatch[1]
        proj = proj.replace(
          new RegExp(`(${mgUUID}[\\s\\S]*?children = \\()`),
          `$1\n\t\t\t\t${variantUUID} /* InfoPlist.strings */,`
        )
      }

      fs.writeFileSync(pbxprojPath, proj, 'utf8')
      return cfg
    },
  ])

  return config
}

// Android: res/values-{lang}/strings.xml에 app_name 추가
const withAndroidLocalizedAppName = (config) => {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const resDir = path.join(cfg.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res')

      for (const [lang, name] of Object.entries(LOCALIZED_NAMES)) {
        const valuesDir = path.join(resDir, `values-${lang}`)
        if (!fs.existsSync(valuesDir)) fs.mkdirSync(valuesDir, { recursive: true })
        fs.writeFileSync(
          path.join(valuesDir, 'strings.xml'),
          `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <string name="app_name">${name}</string>\n</resources>\n`
        )
      }

      return cfg
    },
  ])
}

const withLocalizedAppName = (config) => {
  config = withIosLocalizedAppName(config)
  config = withAndroidLocalizedAppName(config)
  return config
}

module.exports = withLocalizedAppName
