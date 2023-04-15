#!/bin/bash

if [ $# -eq 0 ]; then
  echo "Usage: $0 <circuit_dir_name>"
  exit 1
fi

file_names=("inputs.json" "package.json")

file_suffixes=(".circom" ".js" "md")

dir_path="./circuit/$1"

# first delete file in circuit/xxxx
find "$dir_path" -type f | while read file_path; do
  file_name=$(basename "$file_path")
  file_suffix="${file_name##*.}"

  if [[ "${file_names[@]}" =~ "$file_name" ]] || [[ "${file_suffixes[@]}" =~ "$file_suffix" ]]; then
    continue
  fi

  rm "$file_path"
done

# delete circuit_js dir
cd $dir_path && rm -rf "circuit_js"

