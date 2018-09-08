# google-kv-translate
Use Google API to batch translate strings in JSON key value file
  
# Setup
  
```
pnpm install
```
  
# Usage
  
```
node kvtranslate [options] &lt;input file path&gt;  
  
        -d &lt;output directory path&gt;  
           default: current directory  
  
        -i &lt;input locale string&gt;  
           default: automatic detection from contents of source file, e.g., fr-FR 
  
        -o &lt;output locale string&gt;  
           default: system locale, e.g., en-US 
```
  
# Examples
  
Both of the following invocations will result in an output file of keyvalues\_es\_ES.json.
American English will be translated to the Spanish of Spain.
  
```
node kvtranslate -d out -i en_US -o es_ES keyvalues.json
node kvtranslate -d out -i en_US -o es_ES keyvalues_en_US.json
```

# Contributors
Initial development was started using node v10.8.0. Package management is
done with pnpm and hence the existence of shrinkwrap.yaml. If updating
dependencies in package.json, please do not use older tools such as npm
or yarn. In fact, git has been told to ignore yarn.lock.
