const { withDangerousMod, withInfoPlist } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

const LOCALIZED_NAMES = {
  ja: '花粉の呼吸',
  ko: '꽃가루의 호흡',
  en: 'Pollen Breathing',
}

// iOS: CFBundleLocalizations + per-locale InfoPlist.strings
const withIosLocalizedAppName = (config) => {
  // 1. Info.plist에 CFBundleLocalizations 추가
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.CFBundleLocalizations = Object.keys(LOCALIZED_NAMES)
    return cfg
  })

  // 2. {lang}.lproj/InfoPlist.strings 파일 생성
  config = withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const projectName = cfg.modRequest.projectName
      const iosDir = cfg.modRequest.platformProjectRoot
      const appDir = path.join(iosDir, projectName)

      for (const [lang, name] of Object.entries(LOCALIZED_NAMES)) {
        const lprojDir = path.join(appDir, `${lang}.lproj`)
        if (!fs.existsSync(lprojDir)) {
          fs.mkdirSync(lprojDir, { recursive: true })
        }
        fs.writeFileSync(
          path.join(lprojDir, 'InfoPlist.strings'),
          `CFBundleDisplayName = "${name}";\n`
        )
      }

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
        if (!fs.existsSync(valuesDir)) {
          fs.mkdirSync(valuesDir, { recursive: true })
        }
        const stringsPath = path.join(valuesDir, 'strings.xml')
        fs.writeFileSync(
          stringsPath,
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
