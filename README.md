# google-kv-translate
Use Google Cloud Translation API to batch translate strings in JSON key value file.
  
# Setup
  
1. See [https://cloud.google.com/translate/](https://cloud.google.com/translate/) and follow the steps outlined there for setting up billing, cloud project, account and credentials file.
2. Download the JSON credentials file generated as part of step 1 and assign its file path to the GOOGLE\_APPLICATION\_CREDENTIALS environment variable.
3. 
```
pnpm install
```
  
# Usage
  
```
node kvtranslate [options] <input file path>  
  
        -d <output directory path>  
           default: current directory  
  
        -f <input locale string>  
           default: automatic detection from contents of source file, e.g., fr-FR 
        -t <output locale string>  
           default: system locale, e.g., en-US 
```
  
# Examples
  
Both of the following invocations will result in an output file of keyvalues\_es\_ES.json.
American English will be translated to Spanish.
Note that the region suffix of the locale is effectively ignored by Google.
This program supports it for future updates, such as distinguishing between
American English and English in Great Britain.
  
```
node kvtranslate -d out -f en_US -t es_ES keyvalues.json
node kvtranslate -d out -f en_US -t es_ES keyvalues_en_US.json
```

# Contributors
Initial development was started using node v10.8.0. Package management is
done with pnpm and hence the existence of shrinkwrap.yaml. If updating
dependencies in package.json, please do not use older tools such as npm
or yarn. In fact, git has been told to ignore yarn.lock.
