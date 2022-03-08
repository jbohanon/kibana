filename="./2020_dirs_file.txt"

while read line
do
  echo "### Truncating $line"
  gsutil -m rm -r gs://elastic-bekitzur-kibana-coverage-live/$line
done < $filename
